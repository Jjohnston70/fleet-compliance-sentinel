import { Enrollment, ModuleCompletion } from '../data/schema';
import { IRepository } from '../data/repository';

export interface ProgressSummary {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  progressPct: number;
  modulesCompleted: number;
  totalModules: number;
  timeSpentHours: number;
  currentStreak: number;
  lastActivity: Date | null;
  averageScore: number;
}

export class ProgressService {
  constructor(private repo: IRepository) {}

  async recordModuleCompletion(
    enrollmentId: string,
    moduleId: string,
    score?: number,
    timeSpentMinutes?: number
  ): Promise<ModuleCompletion> {
    const enrollment = await this.repo.getEnrollment(enrollmentId);
    if (!enrollment) throw new Error(`Enrollment ${enrollmentId} not found`);

    const completion: ModuleCompletion = {
      module_id: moduleId,
      completed_at: new Date(),
      score,
    };

    return completion;
  }

  async getProgressSummary(enrollmentId: string): Promise<ProgressSummary> {
    const enrollment = await this.repo.getEnrollment(enrollmentId);
    if (!enrollment) throw new Error(`Enrollment ${enrollmentId} not found`);

    const course = await this.repo.getCourse(enrollment.course_id);
    if (!course) throw new Error('Course not found');

    const avgScore =
      enrollment.module_completions.length > 0
        ? enrollment.module_completions.reduce(
            (sum, mc) => sum + (mc.score || 0),
            0
          ) / enrollment.module_completions.length
        : 0;

    const lastActivity =
      enrollment.module_completions.length > 0
        ? enrollment.module_completions[
            enrollment.module_completions.length - 1
          ].completed_at
        : null;

    const currentStreak = this.calculateStreak(
      enrollment.module_completions
    );

    return {
      enrollmentId,
      studentId: enrollment.student_id,
      courseId: enrollment.course_id,
      progressPct: enrollment.progress_pct,
      modulesCompleted: enrollment.module_completions.length,
      totalModules: course.modules.length,
      timeSpentHours: Math.round(enrollment.time_spent_minutes / 60),
      currentStreak,
      lastActivity,
      averageScore: Math.round(avgScore * 100) / 100,
    };
  }

  async getStudentProgressAcrossEnrollments(
    studentId: string
  ): Promise<ProgressSummary[]> {
    const enrollments = await this.repo.listEnrollments({
      studentId,
      status: 'active',
    });

    const summaries = await Promise.all(
      enrollments.map((e) => this.getProgressSummary(e.id))
    );

    return summaries;
  }

  private calculateStreak(completions: ModuleCompletion[]): number {
    if (completions.length === 0) return 0;

    const sortedCompletions = [...completions].sort(
      (a, b) => b.completed_at.getTime() - a.completed_at.getTime()
    );

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedCompletions.length - 1; i++) {
      const currentDate = new Date(sortedCompletions[i].completed_at);
      const nextDate = new Date(sortedCompletions[i + 1].completed_at);

      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const dayDiff =
        (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getStudentStats(
    studentId: string
  ): Promise<{
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    totalLearningHours: number;
    averageProgressAcrossActive: number;
  }> {
    const student = await this.repo.getStudent(studentId);
    if (!student) throw new Error(`Student ${studentId} not found`);

    const activeEnrollments = await this.repo.listEnrollments({
      studentId,
      status: 'active',
    });

    const totalProgress =
      activeEnrollments.length > 0
        ? activeEnrollments.reduce((sum, e) => sum + e.progress_pct, 0) /
          activeEnrollments.length
        : 0;

    return {
      totalCoursesEnrolled: student.enrolled_courses.length,
      totalCoursesCompleted: student.completed_courses.length,
      totalLearningHours: student.total_learning_hours,
      averageProgressAcrossActive: Math.round(totalProgress),
    };
  }
}
