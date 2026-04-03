import { Certificate } from '../data/schema';
import { IRepository } from '../data/repository';
export declare class CertificateService {
    private repo;
    constructor(repo: IRepository);
    issueCertificate(studentId: string, courseId: string, courseTitle: string): Promise<Certificate>;
    getCertificate(id: string): Promise<Certificate | null>;
    getStudentCertificates(studentId: string): Promise<Certificate[]>;
    verifyCertificate(certificateNumber: string): Promise<Certificate | null>;
    private generateCertificateNumber;
    private generateVerificationUrl;
}
//# sourceMappingURL=certificate-service.d.ts.map