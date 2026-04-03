import { IRepository } from '../data/repository';
import { CertificateService } from '../services/certificate-service';

export interface CompletionEvent {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  completedAt: Date;
}

export class CompletionHandler {
  constructor(
    private repo: IRepository,
    private certificateService: CertificateService
  ) {}

  async onCourseCompleted(event: CompletionEvent): Promise<void> {
    // Issue certificate
    const course = await this.repo.getCourse(event.courseId);
    if (course) {
      await this.certificateService.issueCertificate(
        event.studentId,
        event.courseId,
        course.title
      );
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
    console.log(
      `[COMPLETION] Student ${event.studentId} completed course ${event.courseId}`
    );
  }

  private async offerFollowUpConsultation(studentId: string): Promise<void> {
    const student = await this.repo.getStudent(studentId);
    if (!student) return;

    // Check if student plan allows consultations
    const plansWithConsultations = ['professional', 'enterprise'];
    if (plansWithConsultations.includes(student.plan)) {
      console.log(
        `[CONSULTATION_OFFER] Follow-up consultation offer sent to ${student.email}`
      );
    }
  }
}
