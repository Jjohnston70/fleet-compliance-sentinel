"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentTrigger = void 0;
class EnrollmentTrigger {
    constructor(repo) {
        this.repo = repo;
    }
    async onStudentEnrolled(event) {
        // Send welcome email sequence
        await this.sendWelcomeEmail(event.studentId, event.courseId);
        // Update course enrollment count
        const course = await this.repo.getCourse(event.courseId);
        if (course) {
            await this.repo.updateCourse(event.courseId, {
                enrolled_count: course.enrolled_count + 1,
            });
        }
        // Log event for analytics
        console.log(`[ENROLLMENT] Student ${event.studentId} enrolled in course ${event.courseId}`);
    }
    async sendWelcomeEmail(studentId, courseId) {
        const student = await this.repo.getStudent(studentId);
        const course = await this.repo.getCourse(courseId);
        if (!student || !course)
            return;
        // In a real system, this would send an actual email
        console.log(`[EMAIL] Welcome email sent to ${student.email} for course "${course.title}"`);
    }
}
exports.EnrollmentTrigger = EnrollmentTrigger;
//# sourceMappingURL=enrollment-trigger.js.map