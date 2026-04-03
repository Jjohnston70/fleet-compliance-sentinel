"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIHandlers = void 0;
const services_1 = require("../services");
class APIHandlers {
    constructor(repo) {
        this.courseService = new services_1.CourseService(repo);
        this.certificateService = new services_1.CertificateService(repo);
        this.enrollmentService = new services_1.EnrollmentService(repo, this.certificateService);
        this.progressService = new services_1.ProgressService(repo);
        this.workshopService = new services_1.WorkshopService(repo);
        this.consultationService = new services_1.ConsultationService(repo);
        this.resourceService = new services_1.ResourceService(repo);
    }
    // Course handlers
    async listCourses(filters) {
        return this.courseService.listCourses(filters);
    }
    async getCourse(id) {
        return this.courseService.getCourse(id);
    }
    async createCourse(course) {
        return this.courseService.createCourse(course);
    }
    // Enrollment handlers
    async enrollStudent(studentId, courseId) {
        return this.enrollmentService.enrollStudent(studentId, courseId);
    }
    async getEnrollmentProgress(enrollmentId) {
        return this.enrollmentService.getEnrollmentProgress(enrollmentId);
    }
    async completeModule(enrollmentId, moduleId, score) {
        return this.enrollmentService.completeModule(enrollmentId, moduleId, score);
    }
    // Progress handlers
    async getProgressSummary(enrollmentId) {
        return this.progressService.getProgressSummary(enrollmentId);
    }
    async getStudentStats(studentId) {
        return this.progressService.getStudentStats(studentId);
    }
    // Workshop handlers
    async listWorkshops(filters) {
        return this.workshopService.listWorkshops(filters);
    }
    async getWorkshop(id) {
        return this.workshopService.getWorkshop(id);
    }
    async registerForWorkshop(workshopId, studentId) {
        return this.workshopService.registerForWorkshop(workshopId, studentId);
    }
    async recordAttendance(registrationId, attended) {
        return this.workshopService.recordAttendance(registrationId, attended);
    }
    // Consultation handlers
    async bookConsultation(studentId, consultantId, type, date, startTime, endTime, timezone) {
        return this.consultationService.bookConsultation(studentId, consultantId, type, date, startTime, endTime, timezone);
    }
    async listConsultations(studentId, filters) {
        return this.consultationService.listStudentConsultations(studentId, filters);
    }
    // Resource handlers
    async listResources(filters) {
        return this.resourceService.listResources(filters);
    }
    async getResource(id, studentPlan) {
        if (studentPlan) {
            return this.resourceService.getResourceWithAccessCheck(id, studentPlan);
        }
        return this.resourceService.getResource(id);
    }
    // Certificate handlers
    async getStudentCertificates(studentId) {
        return this.certificateService.getStudentCertificates(studentId);
    }
    async issueCertificate(studentId, courseId, courseTitle) {
        return this.certificateService.issueCertificate(studentId, courseId, courseTitle);
    }
    async verifyCertificate(certificateNumber) {
        return this.certificateService.verifyCertificate(certificateNumber);
    }
    // Dashboard handler
    async getStudentDashboard(studentId) {
        const student = await this.repo?.getStudent(studentId);
        if (!student)
            return null;
        const stats = await this.progressService.getStudentStats(studentId);
        const enrollments = await this.progressService.getStudentProgressAcrossEnrollments(studentId);
        const certificates = await this.certificateService.getStudentCertificates(studentId);
        return {
            student,
            stats,
            activeEnrollments: enrollments,
            certificates,
        };
    }
}
exports.APIHandlers = APIHandlers;
//# sourceMappingURL=handlers.js.map