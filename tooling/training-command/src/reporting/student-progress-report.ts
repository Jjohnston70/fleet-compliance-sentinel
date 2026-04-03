import { IRepository } from '../data/repository';

export interface StudentProgressMetrics {
  studentId: string;
  studentName: string;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  completionRate: number;
  totalLearningHours: number;
  averageModuleScore: number;
  certificatesEarned: number;
}

export interface AggregateProgressMetrics {
  totalStudents: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageCompletionRate: number;
  averageLearningHours: number;
  totalCertificatesIssued: number;
}

export class StudentProgressReport {
  constructor(private repo: IRepository) {}

  async getStudentProgress(studentId: string): Promise<StudentProgressMetrics> {
    const student = await this.repo.getStudent(studentId);
    if (!student) throw new Error(`Student ${studentId} not found`);

    const enrollments = await this.repo.listEnrollments({ studentId });
    const certificates = await this.repo.listCertificates({ studentId });

    const avgScore =
      enrollments.length > 0
        ? enrollments.reduce((sum, e) => {
            const moduleScores = e.module_completions
              .map((mc) => mc.score || 0)
              .filter((s) => s > 0);
            return (
              sum +
              (moduleScores.length > 0
                ? moduleScores.reduce((a, b) => a + b) / moduleScores.length
                : 0)
            );
          }, 0) / enrollments.length
        : 0;

    const completionRate =
      enrollments.length > 0
        ? (
            (enrollments.filter((e) => e.status === 'completed').length /
              enrollments.length) *
            100
          ).toFixed(1)
        : '0';

    return {
      studentId,
      studentName: student.name,
      totalCoursesEnrolled: student.enrolled_courses.length,
      totalCoursesCompleted: student.completed_courses.length,
      completionRate: parseFloat(completionRate),
      totalLearningHours: student.total_learning_hours,
      averageModuleScore: Math.round(avgScore * 100) / 100,
      certificatesEarned: certificates.length,
    };
  }

  async getAggregateProgress(): Promise<AggregateProgressMetrics> {
    const students = await this.repo.listStudents();
    const enrollments = await this.repo.listEnrollments({});
    const certificates = await this.repo.listCertificates({});

    const activeEnrollments = enrollments.filter(
      (e) => e.status === 'active'
    ).length;
    const completedEnrollments = enrollments.filter(
      (e) => e.status === 'completed'
    ).length;

    const avgCompletionRate =
      enrollments.length > 0
        ? (completedEnrollments / enrollments.length) * 100
        : 0;

    const avgLearningHours =
      students.length > 0
        ? students.reduce((sum, s) => sum + s.total_learning_hours, 0) /
          students.length
        : 0;

    return {
      totalStudents: students.length,
      activeEnrollments,
      completedEnrollments,
      averageCompletionRate: Math.round(avgCompletionRate * 100) / 100,
      averageLearningHours: Math.round(avgLearningHours * 100) / 100,
      totalCertificatesIssued: certificates.length,
    };
  }
}
