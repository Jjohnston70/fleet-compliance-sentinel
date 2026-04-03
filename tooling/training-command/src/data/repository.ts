import {
  Course,
  Student,
  Enrollment,
  Workshop,
  WorkshopRegistration,
  Consultation,
  Resource,
  Certificate,
} from './schema';

export interface IRepository {
  // Courses
  createCourse(course: Course): Promise<Course>;
  getCourse(id: string): Promise<Course | null>;
  listCourses(filters?: {
    category?: string;
    level?: string;
    status?: string;
  }): Promise<Course[]>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Students
  createStudent(student: Student): Promise<Student>;
  getStudent(id: string): Promise<Student | null>;
  getStudentByEmail(email: string): Promise<Student | null>;
  listStudents(): Promise<Student[]>;
  updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  // Enrollments
  createEnrollment(enrollment: Enrollment): Promise<Enrollment>;
  getEnrollment(id: string): Promise<Enrollment | null>;
  getEnrollmentByCourseAndStudent(
    courseId: string,
    studentId: string
  ): Promise<Enrollment | null>;
  listEnrollments(filters?: {
    studentId?: string;
    courseId?: string;
    status?: string;
  }): Promise<Enrollment[]>;
  updateEnrollment(
    id: string,
    updates: Partial<Enrollment>
  ): Promise<Enrollment>;
  deleteEnrollment(id: string): Promise<void>;

  // Workshops
  createWorkshop(workshop: Workshop): Promise<Workshop>;
  getWorkshop(id: string): Promise<Workshop | null>;
  listWorkshops(filters?: { status?: string }): Promise<Workshop[]>;
  updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop>;
  deleteWorkshop(id: string): Promise<void>;

  // Workshop Registrations
  createWorkshopRegistration(
    registration: WorkshopRegistration
  ): Promise<WorkshopRegistration>;
  getWorkshopRegistration(id: string): Promise<WorkshopRegistration | null>;
  listWorkshopRegistrations(filters?: {
    workshopId?: string;
    studentId?: string;
    status?: string;
  }): Promise<WorkshopRegistration[]>;
  updateWorkshopRegistration(
    id: string,
    updates: Partial<WorkshopRegistration>
  ): Promise<WorkshopRegistration>;
  deleteWorkshopRegistration(id: string): Promise<void>;

  // Consultations
  createConsultation(consultation: Consultation): Promise<Consultation>;
  getConsultation(id: string): Promise<Consultation | null>;
  listConsultations(filters?: {
    studentId?: string;
    status?: string;
  }): Promise<Consultation[]>;
  updateConsultation(
    id: string,
    updates: Partial<Consultation>
  ): Promise<Consultation>;
  deleteConsultation(id: string): Promise<void>;

  // Resources
  createResource(resource: Resource): Promise<Resource>;
  getResource(id: string): Promise<Resource | null>;
  listResources(filters?: {
    type?: string;
    category?: string;
    access_level?: string;
  }): Promise<Resource[]>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
  deleteResource(id: string): Promise<void>;

  // Certificates
  createCertificate(certificate: Certificate): Promise<Certificate>;
  getCertificate(id: string): Promise<Certificate | null>;
  listCertificates(filters?: {
    studentId?: string;
    courseId?: string;
  }): Promise<Certificate[]>;
  deleteCertificate(id: string): Promise<void>;
}

export class InMemoryRepository implements IRepository {
  private courses = new Map<string, Course>();
  private students = new Map<string, Student>();
  private enrollments = new Map<string, Enrollment>();
  private workshops = new Map<string, Workshop>();
  private workshopRegistrations = new Map<string, WorkshopRegistration>();
  private consultations = new Map<string, Consultation>();
  private resources = new Map<string, Resource>();
  private certificates = new Map<string, Certificate>();

  // Courses
  async createCourse(course: Course): Promise<Course> {
    const id = course.id || crypto.randomUUID();
    const newCourse = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getCourse(id: string): Promise<Course | null> {
    return this.courses.get(id) || null;
  }

  async listCourses(filters?: {
    category?: string;
    level?: string;
    status?: string;
  }): Promise<Course[]> {
    let courses = Array.from(this.courses.values());
    if (filters?.category)
      courses = courses.filter((c) => c.category === filters.category);
    if (filters?.level) courses = courses.filter((c) => c.level === filters.level);
    if (filters?.status)
      courses = courses.filter((c) => c.status === filters.status);
    return courses;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const course = this.courses.get(id);
    if (!course) throw new Error(`Course ${id} not found`);
    const updated = { ...course, ...updates, updated_at: new Date() };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: string): Promise<void> {
    this.courses.delete(id);
  }

  // Students
  async createStudent(student: Student): Promise<Student> {
    const id = student.id || crypto.randomUUID();
    const newStudent = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async getStudent(id: string): Promise<Student | null> {
    return this.students.get(id) || null;
  }

  async getStudentByEmail(email: string): Promise<Student | null> {
    for (const student of this.students.values()) {
      if (student.email === email) return student;
    }
    return null;
  }

  async listStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const student = this.students.get(id);
    if (!student) throw new Error(`Student ${id} not found`);
    const updated = { ...student, ...updates, updated_at: new Date() };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: string): Promise<void> {
    this.students.delete(id);
  }

  // Enrollments
  async createEnrollment(enrollment: Enrollment): Promise<Enrollment> {
    const id = enrollment.id || crypto.randomUUID();
    const newEnrollment = { ...enrollment, id };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async getEnrollment(id: string): Promise<Enrollment | null> {
    return this.enrollments.get(id) || null;
  }

  async getEnrollmentByCourseAndStudent(
    courseId: string,
    studentId: string
  ): Promise<Enrollment | null> {
    for (const enrollment of this.enrollments.values()) {
      if (
        enrollment.course_id === courseId &&
        enrollment.student_id === studentId
      ) {
        return enrollment;
      }
    }
    return null;
  }

  async listEnrollments(filters?: {
    studentId?: string;
    courseId?: string;
    status?: string;
  }): Promise<Enrollment[]> {
    let enrollments = Array.from(this.enrollments.values());
    if (filters?.studentId)
      enrollments = enrollments.filter((e) => e.student_id === filters.studentId);
    if (filters?.courseId)
      enrollments = enrollments.filter((e) => e.course_id === filters.courseId);
    if (filters?.status)
      enrollments = enrollments.filter((e) => e.status === filters.status);
    return enrollments;
  }

  async updateEnrollment(
    id: string,
    updates: Partial<Enrollment>
  ): Promise<Enrollment> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) throw new Error(`Enrollment ${id} not found`);
    const updated = { ...enrollment, ...updates };
    this.enrollments.set(id, updated);
    return updated;
  }

  async deleteEnrollment(id: string): Promise<void> {
    this.enrollments.delete(id);
  }

  // Workshops
  async createWorkshop(workshop: Workshop): Promise<Workshop> {
    const id = workshop.id || crypto.randomUUID();
    const newWorkshop = { ...workshop, id };
    this.workshops.set(id, newWorkshop);
    return newWorkshop;
  }

  async getWorkshop(id: string): Promise<Workshop | null> {
    return this.workshops.get(id) || null;
  }

  async listWorkshops(filters?: { status?: string }): Promise<Workshop[]> {
    let workshops = Array.from(this.workshops.values());
    if (filters?.status)
      workshops = workshops.filter((w) => w.status === filters.status);
    return workshops;
  }

  async updateWorkshop(
    id: string,
    updates: Partial<Workshop>
  ): Promise<Workshop> {
    const workshop = this.workshops.get(id);
    if (!workshop) throw new Error(`Workshop ${id} not found`);
    const updated = { ...workshop, ...updates };
    this.workshops.set(id, updated);
    return updated;
  }

  async deleteWorkshop(id: string): Promise<void> {
    this.workshops.delete(id);
  }

  // Workshop Registrations
  async createWorkshopRegistration(
    registration: WorkshopRegistration
  ): Promise<WorkshopRegistration> {
    const id = registration.id || crypto.randomUUID();
    const newRegistration = { ...registration, id };
    this.workshopRegistrations.set(id, newRegistration);
    return newRegistration;
  }

  async getWorkshopRegistration(id: string): Promise<WorkshopRegistration | null> {
    return this.workshopRegistrations.get(id) || null;
  }

  async listWorkshopRegistrations(filters?: {
    workshopId?: string;
    studentId?: string;
    status?: string;
  }): Promise<WorkshopRegistration[]> {
    let registrations = Array.from(this.workshopRegistrations.values());
    if (filters?.workshopId)
      registrations = registrations.filter((r) => r.workshop_id === filters.workshopId);
    if (filters?.studentId)
      registrations = registrations.filter((r) => r.student_id === filters.studentId);
    if (filters?.status)
      registrations = registrations.filter((r) => r.status === filters.status);
    return registrations;
  }

  async updateWorkshopRegistration(
    id: string,
    updates: Partial<WorkshopRegistration>
  ): Promise<WorkshopRegistration> {
    const registration = this.workshopRegistrations.get(id);
    if (!registration) throw new Error(`Workshop Registration ${id} not found`);
    const updated = { ...registration, ...updates };
    this.workshopRegistrations.set(id, updated);
    return updated;
  }

  async deleteWorkshopRegistration(id: string): Promise<void> {
    this.workshopRegistrations.delete(id);
  }

  // Consultations
  async createConsultation(consultation: Consultation): Promise<Consultation> {
    const id = consultation.id || crypto.randomUUID();
    const newConsultation = { ...consultation, id };
    this.consultations.set(id, newConsultation);
    return newConsultation;
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    return this.consultations.get(id) || null;
  }

  async listConsultations(filters?: {
    studentId?: string;
    status?: string;
  }): Promise<Consultation[]> {
    let consultations = Array.from(this.consultations.values());
    if (filters?.studentId)
      consultations = consultations.filter((c) => c.student_id === filters.studentId);
    if (filters?.status)
      consultations = consultations.filter((c) => c.status === filters.status);
    return consultations;
  }

  async updateConsultation(
    id: string,
    updates: Partial<Consultation>
  ): Promise<Consultation> {
    const consultation = this.consultations.get(id);
    if (!consultation) throw new Error(`Consultation ${id} not found`);
    const updated = { ...consultation, ...updates };
    this.consultations.set(id, updated);
    return updated;
  }

  async deleteConsultation(id: string): Promise<void> {
    this.consultations.delete(id);
  }

  // Resources
  async createResource(resource: Resource): Promise<Resource> {
    const id = resource.id || crypto.randomUUID();
    const newResource = { ...resource, id };
    this.resources.set(id, newResource);
    return newResource;
  }

  async getResource(id: string): Promise<Resource | null> {
    return this.resources.get(id) || null;
  }

  async listResources(filters?: {
    type?: string;
    category?: string;
    access_level?: string;
  }): Promise<Resource[]> {
    let resources = Array.from(this.resources.values());
    if (filters?.type) resources = resources.filter((r) => r.type === filters.type);
    if (filters?.category)
      resources = resources.filter((r) => r.category === filters.category);
    if (filters?.access_level)
      resources = resources.filter((r) => r.access_level === filters.access_level);
    return resources;
  }

  async updateResource(
    id: string,
    updates: Partial<Resource>
  ): Promise<Resource> {
    const resource = this.resources.get(id);
    if (!resource) throw new Error(`Resource ${id} not found`);
    const updated = { ...resource, ...updates };
    this.resources.set(id, updated);
    return updated;
  }

  async deleteResource(id: string): Promise<void> {
    this.resources.delete(id);
  }

  // Certificates
  async createCertificate(certificate: Certificate): Promise<Certificate> {
    const id = certificate.id || crypto.randomUUID();
    const newCertificate = { ...certificate, id };
    this.certificates.set(id, newCertificate);
    return newCertificate;
  }

  async getCertificate(id: string): Promise<Certificate | null> {
    return this.certificates.get(id) || null;
  }

  async listCertificates(filters?: {
    studentId?: string;
    courseId?: string;
  }): Promise<Certificate[]> {
    let certificates = Array.from(this.certificates.values());
    if (filters?.studentId)
      certificates = certificates.filter((c) => c.student_id === filters.studentId);
    if (filters?.courseId)
      certificates = certificates.filter((c) => c.course_id === filters.courseId);
    return certificates;
  }

  async deleteCertificate(id: string): Promise<void> {
    this.certificates.delete(id);
  }
}
