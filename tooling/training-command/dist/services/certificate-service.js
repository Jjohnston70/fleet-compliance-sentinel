"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const index_1 = require("../config/index");
class CertificateService {
    constructor(repo) {
        this.repo = repo;
    }
    async issueCertificate(studentId, courseId, courseTitle) {
        const student = await this.repo.getStudent(studentId);
        if (!student)
            throw new Error(`Student ${studentId} not found`);
        const course = await this.repo.getCourse(courseId);
        if (!course)
            throw new Error(`Course ${courseId} not found`);
        // Check if certificate already issued
        const existing = await this.repo.listCertificates({
            studentId,
            courseId,
        });
        if (existing.length > 0) {
            throw new Error('Certificate already issued for this course');
        }
        const certificateNumber = this.generateCertificateNumber();
        const certificate = {
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
    async getCertificate(id) {
        return this.repo.getCertificate(id);
    }
    async getStudentCertificates(studentId) {
        return this.repo.listCertificates({ studentId });
    }
    async verifyCertificate(certificateNumber) {
        const allCerts = await this.repo.listCertificates({});
        const cert = allCerts.find((c) => c.certificate_number === certificateNumber);
        return cert || null;
    }
    generateCertificateNumber() {
        const year = new Date().getFullYear();
        const sequence = Math.floor(Math.random() * 1000000);
        return index_1.CERTIFICATE_RULES.numberFormat(year, sequence);
    }
    generateVerificationUrl(certificateNumber) {
        const baseUrl = 'https://truenorthai.com/verify';
        return `${baseUrl}/${certificateNumber}`;
    }
}
exports.CertificateService = CertificateService;
//# sourceMappingURL=certificate-service.js.map