"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionHandler = void 0;
class CompletionHandler {
    constructor(repo, certificateService) {
        this.repo = repo;
        this.certificateService = certificateService;
    }
    async onCourseCompleted(event) {
        // Issue certificate
        const course = await this.repo.getCourse(event.courseId);
        if (course) {
            await this.certificateService.issueCertificate(event.studentId, event.courseId, course.title);
        }
        // Update student stats
        const student = await this.repo.getStudent(event.studentId);
        if (student) {
            const completedSet = new Set([...student.completed_courses, event.courseId]);
            await this.repo.updateStudent(event.studentId, {
                completed_courses: Array.from(completedSet),
            });
        }
        // Trigger follow-up consultation offer
        await this.offerFollowUpConsultation(event.studentId);
        // Log event for analytics
        console.log(`[COMPLETION] Student ${event.studentId} completed course ${event.courseId}`);
    }
    async offerFollowUpConsultation(studentId) {
        const student = await this.repo.getStudent(studentId);
        if (!student)
            return;
        // Check if student plan allows consultations
        const plansWithConsultations = ['professional', 'enterprise'];
        if (plansWithConsultations.includes(student.plan)) {
            console.log(`[CONSULTATION_OFFER] Follow-up consultation offer sent to ${student.email}`);
        }
    }
}
exports.CompletionHandler = CompletionHandler;
//# sourceMappingURL=completion-handler.js.map