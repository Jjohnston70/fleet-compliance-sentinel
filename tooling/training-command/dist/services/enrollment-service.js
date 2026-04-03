"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
class EnrollmentService {
    constructor(repo, certificateService) {
        this.repo = repo;
        this.certificateService = certificateService;
    }
    async enrollStudent(studentId, courseId) {
        const student = await this.repo.getStudent(studentId);
        if (!student)
            throw new Error(`Student ${studentId} not found`);
        const course = await this.repo.getCourse(courseId);
        if (!course)
            throw new Error(`Course ${courseId} not found`);
        const existing = await this.repo.getEnrollmentByCourseAndStudent(courseId, studentId);
        if (existing)
            throw new Error('Student already enrolled in this course');
        // Check capacity
        const enrollments = await this.repo.listEnrollments({
            courseId,
            status: 'active',
        });
        if (enrollments.length >= course.max_students) {
            throw new Error('Course is at capacity');
        }
        // Check plan-based access
        const planCourseLimit = this.getCourseLimitForPlan(student.plan);
        if (planCourseLimit !== -1) {
            const activeEnrollments = await this.repo.listEnrollments({
                studentId,
                status: 'active',
            });
            if (activeEnrollments.length >= planCourseLimit) {
                throw new Error(`${student.plan} plan allows maximum ${planCourseLimit} active courses`);
            }
        }
        const enrollment = {
            id: crypto.randomUUID(),
            student_id: studentId,
            course_id: courseId,
            status: 'active',
            enrolled_at: new Date(),
            progress_pct: 0,
            current_module_id: course.modules[0]?.id,
            module_completions: [],
            time_spent_minutes: 0,
        };
        const created = await this.repo.createEnrollment(enrollment);
        // Update student and course
        await this.repo.updateStudent(studentId, {
            enrolled_courses: [...student.enrolled_courses, courseId],
        });
        await this.repo.updateCourse(courseId, {
            enrolled_count: course.enrolled_count + 1,
        });
        return created;
    }
    async getEnrollmentProgress(enrollmentId) {
        return this.repo.getEnrollment(enrollmentId);
    }
    async completeModule(enrollmentId, moduleId, score) {
        const enrollment = await this.repo.getEnrollment(enrollmentId);
        if (!enrollment)
            throw new Error(`Enrollment ${enrollmentId} not found`);
        const course = await this.repo.getCourse(enrollment.course_id);
        if (!course)
            throw new Error(`Course not found`);
        const module = course.modules.find((m) => m.id === moduleId);
        if (!module)
            throw new Error(`Module ${moduleId} not found`);
        const alreadyCompleted = enrollment.module_completions.some((mc) => mc.module_id === moduleId);
        if (alreadyCompleted) {
            throw new Error(`Module ${moduleId} already completed`);
        }
        enrollment.module_completions.push({
            module_id: moduleId,
            completed_at: new Date(),
            score,
        });
        // Update progress
        const progressPct = Math.round((enrollment.module_completions.length / course.modules.length) * 100);
        const updated = await this.repo.updateEnrollment(enrollmentId, {
            progress_pct: progressPct,
            module_completions: enrollment.module_completions,
            time_spent_minutes: enrollment.time_spent_minutes + module.duration_minutes,
        });
        // Check if course is complete
        if (progressPct === 100) {
            await this.markCourseComplete(enrollmentId);
        }
        return updated;
    }
    async markCourseComplete(enrollmentId) {
        const enrollment = await this.repo.getEnrollment(enrollmentId);
        if (!enrollment)
            throw new Error(`Enrollment ${enrollmentId} not found`);
        const student = await this.repo.getStudent(enrollment.student_id);
        if (!student)
            throw new Error('Student not found');
        const course = await this.repo.getCourse(enrollment.course_id);
        if (!course)
            throw new Error('Course not found');
        // Mark enrollment as completed
        const updated = await this.repo.updateEnrollment(enrollmentId, {
            status: 'completed',
            completed_at: new Date(),
            progress_pct: 100,
        });
        // Update student
        const completedCourses = new Set([
            ...student.completed_courses,
            enrollment.course_id,
        ]);
        const learningHours = Math.round(updated.time_spent_minutes / 60);
        await this.repo.updateStudent(enrollment.student_id, {
            completed_courses: Array.from(completedCourses),
            total_learning_hours: student.total_learning_hours + learningHours,
        });
        // Issue certificate
        await this.certificateService.issueCertificate(enrollment.student_id, enrollment.course_id, course.title);
        return updated;
    }
    async pauseEnrollment(enrollmentId) {
        return this.repo.updateEnrollment(enrollmentId, {
            status: 'paused',
        });
    }
    async resumeEnrollment(enrollmentId) {
        return this.repo.updateEnrollment(enrollmentId, {
            status: 'active',
        });
    }
    async dropEnrollment(enrollmentId) {
        const enrollment = await this.repo.getEnrollment(enrollmentId);
        if (!enrollment)
            throw new Error(`Enrollment ${enrollmentId} not found`);
        const course = await this.repo.getCourse(enrollment.course_id);
        if (course) {
            await this.repo.updateCourse(course.id, {
                enrolled_count: Math.max(0, course.enrolled_count - 1),
            });
        }
        return this.repo.updateEnrollment(enrollmentId, {
            status: 'dropped',
        });
    }
    getCourseLimitForPlan(plan) {
        const limits = {
            free: 2,
            basic: -1, // unlimited
            professional: -1,
            enterprise: -1,
        };
        return limits[plan];
    }
}
exports.EnrollmentService = EnrollmentService;
//# sourceMappingURL=enrollment-service.js.map