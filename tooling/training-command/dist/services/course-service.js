"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
class CourseService {
    constructor(repo) {
        this.repo = repo;
    }
    async createCourse(course) {
        if (course.modules.length === 0) {
            throw new Error('Course must have at least one module');
        }
        const totalDuration = course.modules.reduce((sum, m) => sum + m.duration_minutes, 0);
        if (totalDuration !== course.total_duration_minutes) {
            throw new Error('Total duration must match sum of module durations');
        }
        return this.repo.createCourse(course);
    }
    async getCourse(id) {
        return this.repo.getCourse(id);
    }
    async listCourses(filters) {
        const courses = await this.repo.listCourses({
            category: filters?.category,
            level: filters?.level,
            status: 'published',
        });
        if (filters?.tag) {
            return courses.filter((c) => c.tags.some((t) => t.toLowerCase().includes(filters.tag.toLowerCase())));
        }
        return courses;
    }
    async updateCourse(id, updates) {
        const course = await this.repo.getCourse(id);
        if (!course)
            throw new Error(`Course ${id} not found`);
        if (updates.modules) {
            const totalDuration = updates.modules.reduce((sum, m) => sum + m.duration_minutes, 0);
            if (totalDuration !== (updates.total_duration_minutes || course.total_duration_minutes)) {
                throw new Error('Total duration mismatch');
            }
        }
        return this.repo.updateCourse(id, updates);
    }
    async deleteCourse(id) {
        return this.repo.deleteCourse(id);
    }
    async calculateCourseRating(courseId) {
        // This would aggregate ratings from enrollments in a real system
        const course = await this.repo.getCourse(courseId);
        return course?.rating || 0;
    }
    async checkEnrollmentCapacity(courseId) {
        const course = await this.repo.getCourse(courseId);
        if (!course)
            throw new Error(`Course ${courseId} not found`);
        const enrollments = await this.repo.listEnrollments({
            courseId,
            status: 'active',
        });
        return enrollments.length < course.max_students;
    }
    async searchCourses(query) {
        const courses = await this.repo.listCourses({ status: 'published' });
        const lowerQuery = query.toLowerCase();
        return courses.filter((c) => c.title.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery) ||
            c.tags.some((t) => t.toLowerCase().includes(lowerQuery)));
    }
}
exports.CourseService = CourseService;
//# sourceMappingURL=course-service.js.map