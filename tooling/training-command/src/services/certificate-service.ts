import { Certificate } from '../data/schema';
import { IRepository } from '../data/repository';
import { CERTIFICATE_RULES } from '../config/index';

export class CertificateService {
  constructor(private repo: IRepository) {}

  async issueCertificate(
    studentId: string,
    courseId: string,
    courseTitle: string
  ): Promise<Certificate> {
    const student = await this.repo.getStudent(studentId);
    if (!student) throw new Error(`Student ${studentId} not found`);

    const course = await this.repo.getCourse(courseId);
    if (!course) throw new Error(`Course ${courseId} not found`);

    // Check if certificate already issued
    const existing = await this.repo.listCertificates({
      studentId,
      courseId,
    });

    if (existing.length > 0) {
      throw new Error('Certificate already issued for this course');
    }

    const certificateNumber = this.generateCertificateNumber();

    const certificate: Certificate = {
      id: crypto.randomUUID(),
      student_id: studentId,
      course_id: courseId,
      title: `Certificate of Completion: ${courseTitle}`,
      issued_at: new Date(),
      certificate_number: certificateNumber,
      verification_url: this.generateVerificationUrl(certificateNumber),
    };

    const created = await this.repo.createCertificate(certificate);

    // Update student certifications
    await this.repo.updateStudent(studentId, {
      certifications: [
        ...student.certifications,
        {
          course_id: courseId,
          issued_at: new Date(),
          certificate_url: created.verification_url,
        },
      ],
    });

    return created;
  }

  async getCertificate(id: string): Promise<Certificate | null> {
    return this.repo.getCertificate(id);
  }

  async getStudentCertificates(studentId: string): Promise<Certificate[]> {
    return this.repo.listCertificates({ studentId });
  }

  async verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
    const allCerts = await this.repo.listCertificates({});

    const cert = allCerts.find((c) => c.certificate_number === certificateNumber);

    return cert || null;
  }

  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 1000000);

    return CERTIFICATE_RULES.numberFormat(year, sequence);
  }

  private generateVerificationUrl(certificateNumber: string): string {
    const baseUrl = 'https://truenorthai.com/verify';
    return `${baseUrl}/${certificateNumber}`;
  }
}
