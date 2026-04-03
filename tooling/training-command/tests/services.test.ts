import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository';
import {
  CourseService,
  EnrollmentService,
  ProgressService,
  WorkshopService,
  ConsultationService,
  ResourceService,
  CertificateService,
} from '../src/services';
import { seedCourses, seedStudents, seedWorkshops } from '../src/data/seed';

describe('Training Command Services', () => {
  let repo: InMemoryRepository;
  let courseService: CourseService;
  let enrollmentService: EnrollmentService;
  let progressService: ProgressService;
  let workshopService: WorkshopService;
  let consultationService: ConsultationService;
  let resourceService: ResourceService;
  let certificateService: CertificateService;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    courseService = new CourseService(repo);
    certificateService = new CertificateService(repo);
    enrollmentService = new EnrollmentService(repo, certificateService);
    progressService = new ProgressService(repo);
    workshopService = new WorkshopService(repo);
    consultationService = new ConsultationService(repo);
    resourceService = new ResourceService(repo);

    // Seed data
    for (const course of seedCourses) {
      await repo.createCourse(course);
    }
    for (const student of seedStudents) {
      await repo.createStudent(student);
    }
    for (const workshop of seedWorkshops) {
      await repo.createWorkshop(workshop);
    }
  });

  describe('CourseService', () => {
    it('should list all published courses', async () => {
      const courses = await courseService.listCourses();
      expect(courses.length).toBeGreaterThan(0);
      expect(courses[0].status).toBe('published');
    });

    it('should filter courses by category', async () => {
      const courses = await courseService.listCourses({
        category: 'ai_fundamentals',
      });
      expect(courses.every((c) => c.category === 'ai_fundamentals')).toBe(true);
    });

    it('should filter courses by level', async () => {
      const courses = await courseService.listCourses({ level: 'beginner' });
      expect(courses.every((c) => c.level === 'beginner')).toBe(true);
    });

    it('should search courses by title or description', async () => {
      const results = await courseService.searchCourses('AI');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should check enrollment capacity', async () => {
      const course = seedCourses[0];
      const hasCapacity = await courseService.checkEnrollmentCapacity(
        course.id
      );
      expect(hasCapacity).toBe(true);
    });
  });

  describe('EnrollmentService', () => {
    it('should enroll a student in a course', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      expect(enrollment.student_id).toBe(student.id);
      expect(enrollment.course_id).toBe(course.id);
      expect(enrollment.status).toBe('active');
      expect(enrollment.progress_pct).toBe(0);
    });

    it('should prevent duplicate enrollment', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      await enrollmentService.enrollStudent(student.id, course.id);

      await expect(
        enrollmentService.enrollStudent(student.id, course.id)
      ).rejects.toThrow('already enrolled');
    });

    it('should track module completion', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      const updated = await enrollmentService.completeModule(
        enrollment.id,
        course.modules[0].id,
        85
      );

      expect(updated.module_completions.length).toBe(1);
      expect(updated.module_completions[0].score).toBe(85);
    });

    it('should update progress percentage on module completion', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      const module1 = course.modules[0];
      const updated = await enrollmentService.completeModule(
        enrollment.id,
        module1.id
      );

      const expectedProgress = Math.round(
        (1 / course.modules.length) * 100
      );
      expect(updated.progress_pct).toBe(expectedProgress);
    });

    it('should mark course complete when all modules done', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      for (const module of course.modules) {
        await enrollmentService.completeModule(enrollment.id, module.id);
      }

      const final = await repo.getEnrollment(enrollment.id);
      expect(final?.status).toBe('completed');
      expect(final?.progress_pct).toBe(100);
      expect(final?.completed_at).toBeDefined();
    });

    it('should pause and resume enrollment', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      const paused = await enrollmentService.pauseEnrollment(enrollment.id);
      expect(paused.status).toBe('paused');

      const resumed = await enrollmentService.resumeEnrollment(enrollment.id);
      expect(resumed.status).toBe('active');
    });
  });

  describe('ProgressService', () => {
    it('should get progress summary', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      await enrollmentService.completeModule(
        enrollment.id,
        course.modules[0].id,
        90
      );

      const summary = await progressService.getProgressSummary(enrollment.id);

      expect(summary.studentId).toBe(student.id);
      expect(summary.courseId).toBe(course.id);
      expect(summary.modulesCompleted).toBe(1);
      expect(summary.averageScore).toBe(90);
    });

    it('should track learning streak', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      for (let i = 0; i < 3; i++) {
        await enrollmentService.completeModule(
          enrollment.id,
          course.modules[i].id
        );
      }

      const summary = await progressService.getProgressSummary(enrollment.id);
      expect(summary.currentStreak).toBeGreaterThan(0);
    });

    it('should get student stats', async () => {
      const student = seedStudents[0];
      const stats = await progressService.getStudentStats(student.id);

      expect(stats.totalCoursesEnrolled).toBe(0);
      expect(stats.totalCoursesCompleted).toBe(0);
    });
  });

  describe('WorkshopService', () => {
    it('should list workshops', async () => {
      const workshops = await workshopService.listWorkshops();
      expect(workshops.length).toBeGreaterThan(0);
    });

    it('should register student for workshop', async () => {
      const workshop = seedWorkshops[0];
      const student = seedStudents[0];

      const registration = await workshopService.registerForWorkshop(
        workshop.id,
        student.id
      );

      expect(registration.workshop_id).toBe(workshop.id);
      expect(registration.student_id).toBe(student.id);
      expect(registration.status).toBe('registered');
    });

    it('should prevent duplicate workshop registration', async () => {
      const workshop = seedWorkshops[0];
      const student = seedStudents[0];

      await workshopService.registerForWorkshop(workshop.id, student.id);

      await expect(
        workshopService.registerForWorkshop(workshop.id, student.id)
      ).rejects.toThrow('already registered');
    });

    it('should track workshop attendance', async () => {
      const workshop = seedWorkshops[0];
      const student = seedStudents[0];

      const registration = await workshopService.registerForWorkshop(
        workshop.id,
        student.id
      );

      const attended = await workshopService.recordAttendance(
        registration.id,
        true
      );

      expect(attended.status).toBe('attended');
      expect(attended.attended_at).toBeDefined();
    });
  });

  describe('ConsultationService', () => {
    it('should book consultation', async () => {
      const student = seedStudents[1]; // professional plan
      const consultantId = '550e8400-e29b-41d4-a716-446655440201';

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const consultation = await consultationService.bookConsultation(
        student.id,
        consultantId,
        'one_on_one',
        futureDate,
        '10:00',
        '11:00',
        'America/New_York'
      );

      expect(consultation.student_id).toBe(student.id);
      expect(consultation.status).toBe('scheduled');
    });

    it('should prevent free plan consultations', async () => {
      const student = seedStudents[0]; // free plan
      const consultantId = '550e8400-e29b-41d4-a716-446655440201';

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      await expect(
        consultationService.bookConsultation(
          student.id,
          consultantId,
          'one_on_one',
          futureDate,
          '10:00',
          '11:00',
          'America/New_York'
        )
      ).rejects.toThrow('does not include consultation access');
    });
  });

  describe('ResourceService', () => {
    it('should enforce access level restrictions', async () => {
      const resource = {
        id: crypto.randomUUID(),
        title: 'Premium Resource',
        description: 'Professional resource',
        type: 'white_paper' as const,
        category: 'data_strategy',
        industry: 'Technology',
        url: 'https://example.com/resource',
        access_level: 'professional' as const,
        tags: [],
        created_at: new Date(),
      };

      await repo.createResource(resource);

      // Free student cannot access
      const freeStudent = seedStudents[0];
      await expect(
        resourceService.getResourceWithAccessCheck(
          resource.id,
          freeStudent.plan
        )
      ).rejects.toThrow('does not have access');

      // Professional student can access
      const proStudent = seedStudents[1];
      const accessed = await resourceService.getResourceWithAccessCheck(
        resource.id,
        proStudent.plan
      );
      expect(accessed).toBeDefined();
    });
  });

  describe('CertificateService', () => {
    it('should issue certificate on course completion', async () => {
      const student = seedStudents[0];
      const course = seedCourses[0];

      const enrollment = await enrollmentService.enrollStudent(
        student.id,
        course.id
      );

      for (const module of course.modules) {
        await enrollmentService.completeModule(enrollment.id, module.id);
      }

      const certificates = await repo.listCertificates({ studentId: student.id });
      expect(certificates.length).toBe(1);
      expect(certificates[0].student_id).toBe(student.id);
    });

    it('should generate unique certificate numbers', async () => {
      const student = seedStudents[0];
      const course1 = seedCourses[0];
      const course2 = seedCourses[1];

      const enr1 = await enrollmentService.enrollStudent(
        student.id,
        course1.id
      );
      const enr2 = await enrollmentService.enrollStudent(
        student.id,
        course2.id
      );

      for (const module of course1.modules) {
        await enrollmentService.completeModule(enr1.id, module.id);
      }
      for (const module of course2.modules) {
        await enrollmentService.completeModule(enr2.id, module.id);
      }

      const certificates = await repo.listCertificates({ studentId: student.id });
      expect(certificates.length).toBe(2);
      expect(certificates[0].certificate_number).not.toBe(
        certificates[1].certificate_number
      );
    });
  });
});
