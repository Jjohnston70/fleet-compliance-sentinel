import { Course, Student, Enrollment, Workshop, WorkshopRegistration, Consultation, Resource, Certificate } from './schema';
export interface IRepository {
    createCourse(course: Course): Promise<Course>;
    getCourse(id: string): Promise<Course | null>;
    listCourses(filters?: {
        category?: string;
        level?: string;
        status?: string;
    }): Promise<Course[]>;
    updateCourse(id: string, updates: Partial<Course>): Promise<Course>;
    deleteCourse(id: string): Promise<void>;
    createStudent(student: Student): Promise<Student>;
    getStudent(id: string): Promise<Student | null>;
    getStudentByEmail(email: string): Promise<Student | null>;
    listStudents(): Promise<Student[]>;
    updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
    deleteStudent(id: string): Promise<void>;
    createEnrollment(enrollment: Enrollment): Promise<Enrollment>;
    getEnrollment(id: string): Promise<Enrollment | null>;
    getEnrollmentByCourseAndStudent(courseId: string, studentId: string): Promise<Enrollment | null>;
    listEnrollments(filters?: {
        studentId?: string;
        courseId?: string;
        status?: string;
    }): Promise<Enrollment[]>;
    updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment>;
    deleteEnrollment(id: string): Promise<void>;
    createWorkshop(workshop: Workshop): Promise<Workshop>;
    getWorkshop(id: string): Promise<Workshop | null>;
    listWorkshops(filters?: {
        status?: string;
    }): Promise<Workshop[]>;
    updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop>;
    deleteWorkshop(id: string): Promise<void>;
    createWorkshopRegistration(registration: WorkshopRegistration): Promise<WorkshopRegistration>;
    getWorkshopRegistration(id: string): Promise<WorkshopRegistration | null>;
    listWorkshopRegistrations(filters?: {
        workshopId?: string;
        studentId?: string;
        status?: string;
    }): Promise<WorkshopRegistration[]>;
    updateWorkshopRegistration(id: string, updates: Partial<WorkshopRegistration>): Promise<WorkshopRegistration>;
    deleteWorkshopRegistration(id: string): Promise<void>;
    createConsultation(consultation: Consultation): Promise<Consultation>;
    getConsultation(id: string): Promise<Consultation | null>;
    listConsultations(filters?: {
        studentId?: string;
        status?: string;
    }): Promise<Consultation[]>;
    updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation>;
    deleteConsultation(id: string): Promise<void>;
    createResource(resource: Resource): Promise<Resource>;
    getResource(id: string): Promise<Resource | null>;
    listResources(filters?: {
        type?: string;
        category?: string;
        access_level?: string;
    }): Promise<Resource[]>;
    updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
    deleteResource(id: string): Promise<void>;
    createCertificate(certificate: Certificate): Promise<Certificate>;
    getCertificate(id: string): Promise<Certificate | null>;
    listCertificates(filters?: {
        studentId?: string;
        courseId?: string;
    }): Promise<Certificate[]>;
    deleteCertificate(id: string): Promise<void>;
}
export declare class InMemoryRepository implements IRepository {
    private courses;
    private students;
    private enrollments;
    private workshops;
    private workshopRegistrations;
    private consultations;
    private resources;
    private certificates;
    createCourse(course: Course): Promise<Course>;
    getCourse(id: string): Promise<Course | null>;
    listCourses(filters?: {
        category?: string;
        level?: string;
        status?: string;
    }): Promise<Course[]>;
    updateCourse(id: string, updates: Partial<Course>): Promise<Course>;
    deleteCourse(id: string): Promise<void>;
    createStudent(student: Student): Promise<Student>;
    getStudent(id: string): Promise<Student | null>;
    getStudentByEmail(email: string): Promise<Student | null>;
    listStudents(): Promise<Student[]>;
    updateStudent(id: string, updates: Partial<Student>): Promise<Student>;
    deleteStudent(id: string): Promise<void>;
    createEnrollment(enrollment: Enrollment): Promise<Enrollment>;
    getEnrollment(id: string): Promise<Enrollment | null>;
    getEnrollmentByCourseAndStudent(courseId: string, studentId: string): Promise<Enrollment | null>;
    listEnrollments(filters?: {
        studentId?: string;
        courseId?: string;
        status?: string;
    }): Promise<Enrollment[]>;
    updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment>;
    deleteEnrollment(id: string): Promise<void>;
    createWorkshop(workshop: Workshop): Promise<Workshop>;
    getWorkshop(id: string): Promise<Workshop | null>;
    listWorkshops(filters?: {
        status?: string;
    }): Promise<Workshop[]>;
    updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop>;
    deleteWorkshop(id: string): Promise<void>;
    createWorkshopRegistration(registration: WorkshopRegistration): Promise<WorkshopRegistration>;
    getWorkshopRegistration(id: string): Promise<WorkshopRegistration | null>;
    listWorkshopRegistrations(filters?: {
        workshopId?: string;
        studentId?: string;
        status?: string;
    }): Promise<WorkshopRegistration[]>;
    updateWorkshopRegistration(id: string, updates: Partial<WorkshopRegistration>): Promise<WorkshopRegistration>;
    deleteWorkshopRegistration(id: string): Promise<void>;
    createConsultation(consultation: Consultation): Promise<Consultation>;
    getConsultation(id: string): Promise<Consultation | null>;
    listConsultations(filters?: {
        studentId?: string;
        status?: string;
    }): Promise<Consultation[]>;
    updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation>;
    deleteConsultation(id: string): Promise<void>;
    createResource(resource: Resource): Promise<Resource>;
    getResource(id: string): Promise<Resource | null>;
    listResources(filters?: {
        type?: string;
        category?: string;
        access_level?: string;
    }): Promise<Resource[]>;
    updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
    deleteResource(id: string): Promise<void>;
    createCertificate(certificate: Certificate): Promise<Certificate>;
    getCertificate(id: string): Promise<Certificate | null>;
    listCertificates(filters?: {
        studentId?: string;
        courseId?: string;
    }): Promise<Certificate[]>;
    deleteCertificate(id: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map