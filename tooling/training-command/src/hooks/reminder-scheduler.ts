import { IRepository } from '../data/repository';

export class ReminderScheduler {
  constructor(private repo: IRepository) {}

  async checkInactiveEnrollments(inactiveDays: number = 7): Promise<void> {
    const enrollments = await this.repo.listEnrollments({
      status: 'active',
    });

    const now = new Date();
    const threshold = new Date(now.getTime() - inactiveDays * 24 * 60 * 60 * 1000);

    for (const enrollment of enrollments) {
      const lastActivity =
        enrollment.module_completions.length > 0
          ? enrollment.module_completions[
              enrollment.module_completions.length - 1
            ].completed_at
          : enrollment.enrolled_at;

      if (lastActivity < threshold) {
        await this.sendInactivityReminder(
          enrollment.student_id,
          enrollment.course_id
        );
      }
    }
  }

  private async sendInactivityReminder(
    studentId: string,
    courseId: string
  ): Promise<void> {
    const student = await this.repo.getStudent(studentId);
    const course = await this.repo.getCourse(courseId);

    if (!student || !course) return;

    // In a real system, this would send an actual email
    console.log(
      `[REMINDER] Inactivity reminder sent to ${student.email} for course "${course.title}"`
    );
  }

  async generateProgressNotifications(): Promise<void> {
    const enrollments = await this.repo.listEnrollments({
      status: 'active',
    });

    for (const enrollment of enrollments) {
      if (enrollment.progress_pct === 75) {
        const student = await this.repo.getStudent(enrollment.student_id);
        if (student) {
          console.log(
            `[NOTIFICATION] 75% complete milestone for ${student.email}`
          );
        }
      }

      if (enrollment.progress_pct === 100) {
        const student = await this.repo.getStudent(enrollment.student_id);
        if (student) {
          console.log(
            `[NOTIFICATION] Course completion congratulations sent to ${student.email}`
          );
        }
      }
    }
  }
}
