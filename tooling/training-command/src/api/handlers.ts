import {
  CourseService,
  EnrollmentService,
  ProgressService,
  WorkshopService,
  ConsultationService,
  ResourceService,
  CertificateService,
} from '../services';
import { IRepository } from '../data/repository';
import { Course, Workshop, Consultation } from '../data/schema';

export class APIHandlers {
  private courseService: CourseService;
  private enrollmentService: EnrollmentService;
  private progressService: ProgressService;
  private workshopService: WorkshopService;
  private consultationService: ConsultationService;
  private resourceService: ResourceService;
  private certificateService: CertificateService;

  constructor(repo: IRepository) {
    this.courseService = new CourseService(repo);
    this.certificateService = new CertificateService(repo);
    this.enrollmentService = new EnrollmentService(repo, this.certificateService);
    this.progressService = new ProgressService(repo);
    this.workshopService = new WorkshopService(repo);
    this.consultationService = new ConsultationService(repo);
    this.resourceService = new ResourceService(repo);
  }

  // Course handlers
  async listCourses(filters?: {
    category?: string;
    level?: string;
  }): Promise<Course[]> {
    return this.courseService.listCourses(filters);
  }

  async getCourse(id: string): Promise<Course | null> {
    return this.courseService.getCourse(id);
  }

  async createCourse(course: Course): Promise<Course> {
    return this.courseService.createCourse(course);
  }

  // Enrollment handlers
  async enrollStudent(studentId: string, courseId: string) {
    return this.enrollmentService.enrollStudent(studentId, courseId);
  }

  async getEnrollmentProgress(enrollmentId: string) {
    return this.enrollmentService.getEnrollmentProgress(enrollmentId);
  }

  async completeModule(
    enrollmentId: string,
    moduleId: string,
    score?: number
  ) {
    return this.enrollmentService.completeModule(enrollmentId, moduleId, score);
  }

  // Progress handlers
  async getProgressSummary(enrollmentId: string) {
    return this.progressService.getProgressSummary(enrollmentId);
  }

  async getStudentStats(studentId: string) {
    return this.progressService.getStudentStats(studentId);
  }

  // Workshop handlers
  async listWorkshops(filters?: { status?: string }): Promise<Workshop[]> {
    return this.workshopService.listWorkshops(filters);
  }

  async getWorkshop(id: string): Promise<Workshop | null> {
    return this.workshopService.getWorkshop(id);
  }

  async registerForWorkshop(workshopId: string, studentId: string) {
    return this.workshopService.registerForWorkshop(workshopId, studentId);
  }

  async recordAttendance(registrationId: string, attended: boolean) {
    return this.workshopService.recordAttendance(registrationId, attended);
  }

  // Consultation handlers
  async bookConsultation(
    studentId: string,
    consultantId: string,
    type: 'one_on_one' | 'team' | 'assessment_review',
    date: Date,
    startTime: string,
    endTime: string,
    timezone: string
  ): Promise<Consultation> {
    return this.consultationService.bookConsultation(
      studentId,
      consultantId,
      type,
      date,
      startTime,
      endTime,
      timezone
    );
  }

  async listConsultations(
    studentId: string,
    filters?: { status?: string }
  ) {
    return this.consultationService.listStudentConsultations(
      studentId,
      filters
    );
  }

  // Resource handlers
  async listResources(filters?: {
    type?: string;
    category?: string;
    studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise';
  }) {
    return this.resourceService.listResources(filters);
  }

  async getResource(
    id: string,
    studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise'
  ) {
    if (studentPlan) {
      return this.resourceService.getResourceWithAccessCheck(id, studentPlan);
    }
    return this.resourceService.getResource(id);
  }

  // Certificate handlers
  async getStudentCertificates(studentId: string) {
    return this.certificateService.getStudentCertificates(studentId);
  }

  async issueCertificate(
    studentId: string,
    courseId: string,
    courseTitle: string
  ) {
    return this.certificateService.issueCertificate(
      studentId,
      courseId,
      courseTitle
    );
  }

  async verifyCertificate(certificateNumber: string) {
    return this.certificateService.verifyCertificate(certificateNumber);
  }

  // Dashboard handler
  async getStudentDashboard(studentId: string) {
    const student = await (this as any).repo?.getStudent(studentId);
    if (!student) return null;

    const stats = await this.progressService.getStudentStats(studentId);
    const enrollments = await this.progressService.getStudentProgressAcrossEnrollments(
      studentId
    );
    const certificates = await this.certificateService.getStudentCertificates(
      studentId
    );

    return {
      student,
      stats,
      activeEnrollments: enrollments,
      certificates,
    };
  }
}
