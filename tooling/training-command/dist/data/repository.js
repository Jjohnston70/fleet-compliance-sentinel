"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRepository = void 0;
class InMemoryRepository {
    constructor() {
        this.courses = new Map();
        this.students = new Map();
        this.enrollments = new Map();
        this.workshops = new Map();
        this.workshopRegistrations = new Map();
        this.consultations = new Map();
        this.resources = new Map();
        this.certificates = new Map();
    }
    // Courses
    async createCourse(course) {
        const id = course.id || crypto.randomUUID();
        const newCourse = { ...course, id };
        this.courses.set(id, newCourse);
        return newCourse;
    }
    async getCourse(id) {
        return this.courses.get(id) || null;
    }
    async listCourses(filters) {
        let courses = Array.from(this.courses.values());
        if (filters?.category)
            courses = courses.filter((c) => c.category === filters.category);
        if (filters?.level)
            courses = courses.filter((c) => c.level === filters.level);
        if (filters?.status)
            courses = courses.filter((c) => c.status === filters.status);
        return courses;
    }
    async updateCourse(id, updates) {
        const course = this.courses.get(id);
        if (!course)
            throw new Error(`Course ${id} not found`);
        const updated = { ...course, ...updates, updated_at: new Date() };
        this.courses.set(id, updated);
        return updated;
    }
    async deleteCourse(id) {
        this.courses.delete(id);
    }
    // Students
    async createStudent(student) {
        const id = student.id || crypto.randomUUID();
        const newStudent = { ...student, id };
        this.students.set(id, newStudent);
        return newStudent;
    }
    async getStudent(id) {
        return this.students.get(id) || null;
    }
    async getStudentByEmail(email) {
        for (const student of this.students.values()) {
            if (student.email === email)
                return student;
        }
        return null;
    }
    async listStudents() {
        return Array.from(this.students.values());
    }
    async updateStudent(id, updates) {
        const student = this.students.get(id);
        if (!student)
            throw new Error(`Student ${id} not found`);
        const updated = { ...student, ...updates, updated_at: new Date() };
        this.students.set(id, updated);
        return updated;
    }
    async deleteStudent(id) {
        this.students.delete(id);
    }
    // Enrollments
    async createEnrollment(enrollment) {
        const id = enrollment.id || crypto.randomUUID();
        const newEnrollment = { ...enrollment, id };
        this.enrollments.set(id, newEnrollment);
        return newEnrollment;
    }
    async getEnrollment(id) {
        return this.enrollments.get(id) || null;
    }
    async getEnrollmentByCourseAndStudent(courseId, studentId) {
        for (const enrollment of this.enrollments.values()) {
            if (enrollment.course_id === courseId &&
                enrollment.student_id === studentId) {
                return enrollment;
            }
        }
        return null;
    }
    async listEnrollments(filters) {
        let enrollments = Array.from(this.enrollments.values());
        if (filters?.studentId)
            enrollments = enrollments.filter((e) => e.student_id === filters.studentId);
        if (filters?.courseId)
            enrollments = enrollments.filter((e) => e.course_id === filters.courseId);
        if (filters?.status)
            enrollments = enrollments.filter((e) => e.status === filters.status);
        return enrollments;
    }
    async updateEnrollment(id, updates) {
        const enrollment = this.enrollments.get(id);
        if (!enrollment)
            throw new Error(`Enrollment ${id} not found`);
        const updated = { ...enrollment, ...updates };
        this.enrollments.set(id, updated);
        return updated;
    }
    async deleteEnrollment(id) {
        this.enrollments.delete(id);
    }
    // Workshops
    async createWorkshop(workshop) {
        const id = workshop.id || crypto.randomUUID();
        const newWorkshop = { ...workshop, id };
        this.workshops.set(id, newWorkshop);
        return newWorkshop;
    }
    async getWorkshop(id) {
        return this.workshops.get(id) || null;
    }
    async listWorkshops(filters) {
        let workshops = Array.from(this.workshops.values());
        if (filters?.status)
            workshops = workshops.filter((w) => w.status === filters.status);
        return workshops;
    }
    async updateWorkshop(id, updates) {
        const workshop = this.workshops.get(id);
        if (!workshop)
            throw new Error(`Workshop ${id} not found`);
        const updated = { ...workshop, ...updates };
        this.workshops.set(id, updated);
        return updated;
    }
    async deleteWorkshop(id) {
        this.workshops.delete(id);
    }
    // Workshop Registrations
    async createWorkshopRegistration(registration) {
        const id = registration.id || crypto.randomUUID();
        const newRegistration = { ...registration, id };
        this.workshopRegistrations.set(id, newRegistration);
        return newRegistration;
    }
    async getWorkshopRegistration(id) {
        return this.workshopRegistrations.get(id) || null;
    }
    async listWorkshopRegistrations(filters) {
        let registrations = Array.from(this.workshopRegistrations.values());
        if (filters?.workshopId)
            registrations = registrations.filter((r) => r.workshop_id === filters.workshopId);
        if (filters?.studentId)
            registrations = registrations.filter((r) => r.student_id === filters.studentId);
        if (filters?.status)
            registrations = registrations.filter((r) => r.status === filters.status);
        return registrations;
    }
    async updateWorkshopRegistration(id, updates) {
        const registration = this.workshopRegistrations.get(id);
        if (!registration)
            throw new Error(`Workshop Registration ${id} not found`);
        const updated = { ...registration, ...updates };
        this.workshopRegistrations.set(id, updated);
        return updated;
    }
    async deleteWorkshopRegistration(id) {
        this.workshopRegistrations.delete(id);
    }
    // Consultations
    async createConsultation(consultation) {
        const id = consultation.id || crypto.randomUUID();
        const newConsultation = { ...consultation, id };
        this.consultations.set(id, newConsultation);
        return newConsultation;
    }
    async getConsultation(id) {
        return this.consultations.get(id) || null;
    }
    async listConsultations(filters) {
        let consultations = Array.from(this.consultations.values());
        if (filters?.studentId)
            consultations = consultations.filter((c) => c.student_id === filters.studentId);
        if (filters?.status)
            consultations = consultations.filter((c) => c.status === filters.status);
        return consultations;
    }
    async updateConsultation(id, updates) {
        const consultation = this.consultations.get(id);
        if (!consultation)
            throw new Error(`Consultation ${id} not found`);
        const updated = { ...consultation, ...updates };
        this.consultations.set(id, updated);
        return updated;
    }
    async deleteConsultation(id) {
        this.consultations.delete(id);
    }
    // Resources
    async createResource(resource) {
        const id = resource.id || crypto.randomUUID();
        const newResource = { ...resource, id };
        this.resources.set(id, newResource);
        return newResource;
    }
    async getResource(id) {
        return this.resources.get(id) || null;
    }
    async listResources(filters) {
        let resources = Array.from(this.resources.values());
        if (filters?.type)
            resources = resources.filter((r) => r.type === filters.type);
        if (filters?.category)
            resources = resources.filter((r) => r.category === filters.category);
        if (filters?.access_level)
            resources = resources.filter((r) => r.access_level === filters.access_level);
        return resources;
    }
    async updateResource(id, updates) {
        const resource = this.resources.get(id);
        if (!resource)
            throw new Error(`Resource ${id} not found`);
        const updated = { ...resource, ...updates };
        this.resources.set(id, updated);
        return updated;
    }
    async deleteResource(id) {
        this.resources.delete(id);
    }
    // Certificates
    async createCertificate(certificate) {
        const id = certificate.id || crypto.randomUUID();
        const newCertificate = { ...certificate, id };
        this.certificates.set(id, newCertificate);
        return newCertificate;
    }
    async getCertificate(id) {
        return this.certificates.get(id) || null;
    }
    async listCertificates(filters) {
        let certificates = Array.from(this.certificates.values());
        if (filters?.studentId)
            certificates = certificates.filter((c) => c.student_id === filters.studentId);
        if (filters?.courseId)
            certificates = certificates.filter((c) => c.course_id === filters.courseId);
        return certificates;
    }
    async deleteCertificate(id) {
        this.certificates.delete(id);
    }
}
exports.InMemoryRepository = InMemoryRepository;
//# sourceMappingURL=repository.js.map