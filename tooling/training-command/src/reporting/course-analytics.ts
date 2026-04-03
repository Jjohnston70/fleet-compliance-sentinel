import { IRepository } from '../data/repository';

export interface CourseAnalyticsData {
  courseId: string;
  courseTitle: string;
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  averageProgressPercentage: number;
  averageTimeSpentHours: number;
  averageModuleScore: number;
  dropoutRate: number;
  mostPopularModule: string;
}

export interface CourseEnrollmentTrend {
  date: Date;
  newEnrollments: number;
  completions: number;
  totalActive: number;
}

export class CourseAnalytics {
  constructor(private repo: IRepository) {}

  async getCourseAnalytics(courseId: string): Promise<CourseAnalyticsData> {
    const course = await this.repo.getCourse(courseId);
    if (!course) throw new Error(`Course ${courseId} not found`);

    const enrollments = await this.repo.listEnrollments({ courseId });

    const completed = enrollments.filter((e) => e.status === 'completed').length;
    const dropped = enrollments.filter((e) => e.status === 'dropped').length;
    const avgProgress = Math.round(
      enrollments.reduce((sum, e) => sum + e.progress_pct, 0) /
        (enrollments.length || 1)
    );

    const avgTimeSpent = Math.round(
      enrollments.reduce((sum, e) => sum + e.time_spent_minutes, 0) /
        (enrollments.length || 1) /
        60
    );

    const avgScore =
      enrollments.length > 0
        ? enrollments.reduce((sum, e) => {
            const scores = e.module_completions
              .map((mc) => mc.score || 0)
              .filter((s) => s > 0);
            return (
              sum +
              (scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0)
            );
          }, 0) / enrollments.length
        : 0;

    const dropoutRate =
      enrollments.length > 0
        ? (dropped / enrollments.length) * 100
        : 0;

    // Find most popular module
    const moduleCounts = new Map<string, number>();
    for (const enrollment of enrollments) {
      for (const completion of enrollment.module_completions) {
        moduleCounts.set(
          completion.module_id,
          (moduleCounts.get(completion.module_id) || 0) + 1
        );
      }
    }

    let mostPopularModule = '';
    let maxCount = 0;
    for (const [moduleId, count] of moduleCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostPopularModule = moduleId;
      }
    }

    return {
      courseId,
      courseTitle: course.title,
      totalEnrolled: enrollments.length,
      totalCompleted: completed,
      completionRate: Math.round((completed / (enrollments.length || 1)) * 100),
      averageProgressPercentage: avgProgress,
      averageTimeSpentHours: avgTimeSpent,
      averageModuleScore: Math.round(avgScore * 100) / 100,
      dropoutRate: Math.round(dropoutRate * 100) / 100,
      mostPopularModule,
    };
  }

  async getAllCoursesAnalytics(): Promise<CourseAnalyticsData[]> {
    const courses = await this.repo.listCourses({});

    const analytics = await Promise.all(
      courses.map((c) => this.getCourseAnalytics(c.id))
    );

    return analytics;
  }
}
