import { Workshop, WorkshopRegistration } from '../data/schema';
import { IRepository } from '../data/repository';
import { WORKSHOP_RULES } from '../config/index';

type RegistrationStatusType = 'registered' | 'attended' | 'no_show' | 'cancelled';

export class WorkshopService {
  constructor(private repo: IRepository) {}

  async createWorkshop(workshop: Workshop): Promise<Workshop> {
    if (
      workshop.max_participants < WORKSHOP_RULES.minCapacity ||
      workshop.max_participants > WORKSHOP_RULES.maxCapacity
    ) {
      throw new Error(
        `Participant capacity must be between ${WORKSHOP_RULES.minCapacity} and ${WORKSHOP_RULES.maxCapacity}`
      );
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

  async getWorkshop(id: string): Promise<Workshop | null> {
    return this.repo.getWorkshop(id);
  }

  async listWorkshops(filters?: {
    status?: string;
    instructorId?: string;
  }): Promise<Workshop[]> {
    const workshops = await this.repo.listWorkshops({
      status: filters?.status,
    });

    if (filters?.instructorId) {
      return workshops.filter((w) => w.instructor_id === filters.instructorId);
    }

    return workshops;
  }

  async updateWorkshop(
    id: string,
    updates: Partial<Workshop>
  ): Promise<Workshop> {
    const workshop = await this.repo.getWorkshop(id);
    if (!workshop) throw new Error(`Workshop ${id} not found`);

    return this.repo.updateWorkshop(id, updates);
  }

  async deleteWorkshop(id: string): Promise<void> {
    return this.repo.deleteWorkshop(id);
  }

  async registerForWorkshop(
    workshopId: string,
    studentId: string
  ): Promise<WorkshopRegistration> {
    const workshop = await this.repo.getWorkshop(workshopId);
    if (!workshop) throw new Error(`Workshop ${workshopId} not found`);

    const student = await this.repo.getStudent(studentId);
    if (!student) throw new Error(`Student ${studentId} not found`);

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

    const registration: WorkshopRegistration = {
      id: crypto.randomUUID(),
      workshop_id: workshopId,
      student_id: studentId,
      status: 'registered' as RegistrationStatusType,
      registered_at: new Date(),
    };

    const created = await this.repo.createWorkshopRegistration(registration);

    // Update workshop
    await this.repo.updateWorkshop(workshopId, {
      registered_count: workshop.registered_count + 1,
    });

    return created;
  }

  async cancelRegistration(registrationId: string): Promise<WorkshopRegistration> {
    const registration = await this.repo.getWorkshopRegistration(registrationId);
    if (!registration) throw new Error(`Registration ${registrationId} not found`);

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
      status: 'cancelled' as RegistrationStatusType,
    });
  }

  async recordAttendance(
    registrationId: string,
    attended: boolean
  ): Promise<WorkshopRegistration> {
    const registration = await this.repo.getWorkshopRegistration(registrationId);
    if (!registration) throw new Error(`Registration ${registrationId} not found`);

    return this.repo.updateWorkshopRegistration(registrationId, {
      status: attended ? ('attended' as RegistrationStatusType) : ('no_show' as RegistrationStatusType),
      attended_at: attended ? new Date() : undefined,
    });
  }

  async getRegistrationsForWorkshop(
    workshopId: string
  ): Promise<WorkshopRegistration[]> {
    return this.repo.listWorkshopRegistrations({
      workshopId,
      status: 'registered',
    });
  }

  async getStudentRegistrations(studentId: string): Promise<WorkshopRegistration[]> {
    return this.repo.listWorkshopRegistrations({
      studentId,
    });
  }
}
