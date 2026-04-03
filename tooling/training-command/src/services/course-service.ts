import { Course } from '../data/schema';
import { IRepository } from '../data/repository';

export class CourseService {
  constructor(private repo: IRepository) {}

  async createCourse(course: Course): Promise<Course> {
    if (course.modules.length === 0) {
      throw new Error('Course must have at least one module');
    }

    const totalDuration = course.modules.reduce(
      (sum, m) => sum + m.duration_minutes,
      0
    );

    if (totalDuration !== course.total_duration_minutes) {
      throw new Error(
        'Total duration must match sum of module durations'
      );
    }

    return this.repo.createCourse(course);
  }

  async getCourse(id: string): Promise<Course | null> {
    return this.repo.getCourse(id);
  }

  async listCourses(filters?: {
    category?: string;
    level?: string;
    tag?: string;
  }): Promise<Course[]> {
    const courses = await this.repo.listCourses({
      category: filters?.category,
      level: filters?.level,
      status: 'published',
    });

    if (filters?.tag) {
      return courses.filter((c) =>
        c.tags.some((t) => t.toLowerCase().includes(filters.tag!.toLowerCase()))
      );
    }

    return courses;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const course = await this.repo.getCourse(id);
    if (!course) throw new Error(`Course ${id} not found`);

    if (updates.modules) {
      const totalDuration = updates.modules.reduce(
        (sum, m) => sum + m.duration_minutes,
        0
      );
      if (totalDuration !== (updates.total_duration_minutes || course.total_duration_minutes)) {
        throw new Error('Total duration mismatch');
      }
    }

    return this.repo.updateCourse(id, updates);
  }

  async deleteCourse(id: string): Promise<void> {
    return this.repo.deleteCourse(id);
  }

  async calculateCourseRating(courseId: string): Promise<number> {
    // This would aggregate ratings from enrollments in a real system
    const course = await this.repo.getCourse(courseId);
    return course?.rating || 0;
  }

  async checkEnrollmentCapacity(courseId: string): Promise<boolean> {
    const course = await this.repo.getCourse(courseId);
    if (!course) throw new Error(`Course ${courseId} not found`);

    const enrollments = await this.repo.listEnrollments({
      courseId,
      status: 'active',
    });

    return enrollments.length < course.max_students;
  }

  async searchCourses(query: string): Promise<Course[]> {
    const courses = await this.repo.listCourses({ status: 'published' });

    const lowerQuery = query.toLowerCase();

    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }
}
