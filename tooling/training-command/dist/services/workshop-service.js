"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkshopService = void 0;
const index_1 = require("../config/index");
class WorkshopService {
    constructor(repo) {
        this.repo = repo;
    }
    async createWorkshop(workshop) {
        if (workshop.max_participants < index_1.WORKSHOP_RULES.minCapacity ||
            workshop.max_participants > index_1.WORKSHOP_RULES.maxCapacity) {
            throw new Error(`Participant capacity must be between ${index_1.WORKSHOP_RULES.minCapacity} and ${index_1.WORKSHOP_RULES.maxCapacity}`);
        }
        const [startHour, startMin] = workshop.start_time.split(':').map(Number);
        const [endHour, endMin] = workshop.end_time.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        if (endMinutes <= startMinutes) {
            throw new Error('End time must be after start time');
        }
        return this.repo.createWorkshop(workshop);
    }
    async getWorkshop(id) {
        return this.repo.getWorkshop(id);
    }
    async listWorkshops(filters) {
        const workshops = await this.repo.listWorkshops({
            status: filters?.status,
        });
        if (filters?.instructorId) {
            return workshops.filter((w) => w.instructor_id === filters.instructorId);
        }
        return workshops;
    }
    async updateWorkshop(id, updates) {
        const workshop = await this.repo.getWorkshop(id);
        if (!workshop)
            throw new Error(`Workshop ${id} not found`);
        return this.repo.updateWorkshop(id, updates);
    }
    async deleteWorkshop(id) {
        return this.repo.deleteWorkshop(id);
    }
    async registerForWorkshop(workshopId, studentId) {
        const workshop = await this.repo.getWorkshop(workshopId);
        if (!workshop)
            throw new Error(`Workshop ${workshopId} not found`);
        const student = await this.repo.getStudent(studentId);
        if (!student)
            throw new Error(`Student ${studentId} not found`);
        // Check if already registered
        const existing = await this.repo.listWorkshopRegistrations({
            workshopId,
            studentId,
            status: 'registered',
        });
        if (existing.length > 0) {
            throw new Error('Student already registered for this workshop');
        }
        // Check capacity
        const registrations = await this.repo.listWorkshopRegistrations({
            workshopId,
            status: 'registered',
        });
        if (registrations.length >= workshop.max_participants) {
            throw new Error('Workshop is at capacity');
        }
        const registration = {
            id: crypto.randomUUID(),
            workshop_id: workshopId,
            student_id: studentId,
            status: 'registered',
            registered_at: new Date(),
        };
        const created = await this.repo.createWorkshopRegistration(registration);
        // Update workshop
        await this.repo.updateWorkshop(workshopId, {
            registered_count: workshop.registered_count + 1,
        });
        return created;
    }
    async cancelRegistration(registrationId) {
        const registration = await this.repo.getWorkshopRegistration(registrationId);
        if (!registration)
            throw new Error(`Registration ${registrationId} not found`);
        if (registration.status === 'cancelled') {
            throw new Error('Registration already cancelled');
        }
        const workshop = await this.repo.getWorkshop(registration.workshop_id);
        if (workshop && workshop.registered_count > 0) {
            await this.repo.updateWorkshop(workshop.id, {
                registered_count: workshop.registered_count - 1,
            });
        }
        return this.repo.updateWorkshopRegistration(registrationId, {
            status: 'cancelled',
        });
    }
    async recordAttendance(registrationId, attended) {
        const registration = await this.repo.getWorkshopRegistration(registrationId);
        if (!registration)
            throw new Error(`Registration ${registrationId} not found`);
        return this.repo.updateWorkshopRegistration(registrationId, {
            status: attended ? 'attended' : 'no_show',
            attended_at: attended ? new Date() : undefined,
        });
    }
    async getRegistrationsForWorkshop(workshopId) {
        return this.repo.listWorkshopRegistrations({
            workshopId,
            status: 'registered',
        });
    }
    async getStudentRegistrations(studentId) {
        return this.repo.listWorkshopRegistrations({
            studentId,
        });
    }
}
exports.WorkshopService = WorkshopService;
//# sourceMappingURL=workshop-service.js.map