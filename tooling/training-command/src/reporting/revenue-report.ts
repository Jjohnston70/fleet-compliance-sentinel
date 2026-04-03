import { IRepository } from '../data/repository';

export interface RevenueMetrics {
  byPlanTier: Record<string, number>;
  bySource: {
    courses: number;
    workshops: number;
    consultations: number;
  };
  totalRevenue: number;
  totalStudents: number;
  averageRevenuPerStudent: number;
}

export class RevenueReport {
  constructor(private repo: IRepository) {}

  async getRevenueMetrics(): Promise<RevenueMetrics> {
    const students = await this.repo.listStudents();
    const enrollments = await this.repo.listEnrollments({});
    const workshops = await this.repo.listWorkshops({});
    const consultations = await this.repo.listConsultations({});
    const registrations = await this.repo.listWorkshopRegistrations({
      status: 'attended',
    });

    // Calculate revenue by plan tier
    const byPlanTier: Record<string, number> = {
      free: 0,
      basic: 0,
      professional: 0,
      enterprise: 0,
    };

    for (const student of students) {
      const monthlyRate = this.getMonthlyRate(student.plan);
      byPlanTier[student.plan] += monthlyRate;
    }

    // Calculate course revenue
    const courseRevenue = enrollments
      .filter((e) => e.status === 'completed')
      .reduce((sum, e) => {
        const course = Array.isArray(e)
          ? e
          : (this.repo as any).getCourse(e.course_id);
        return sum + ((course as any)?.price_cents || 0);
      }, 0);

    // Calculate workshop revenue
    const workshopRevenue = registrations.reduce((sum, r) => {
      const workshop = workshops.find((w) => w.id === r.workshop_id);
      return sum + (workshop?.price_cents || 0);
    }, 0);

    // Calculate consultation revenue
    const consultationRevenue = consultations
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + c.price_cents, 0);

    const totalRevenue =
      Object.values(byPlanTier).reduce((a, b) => a + b, 0) +
      courseRevenue +
      workshopRevenue +
      consultationRevenue;

    return {
      byPlanTier,
      bySource: {
        courses: courseRevenue,
        workshops: workshopRevenue,
        consultations: consultationRevenue,
      },
      totalRevenue,
      totalStudents: students.length,
      averageRevenuPerStudent:
        students.length > 0 ? Math.round(totalRevenue / students.length) : 0,
    };
  }

  private getMonthlyRate(
    plan: 'free' | 'basic' | 'professional' | 'enterprise'
  ): number {
    const rates: Record<string, number> = {
      free: 0,
      basic: 4900,
      professional: 9900,
      enterprise: 49900,
    };

    return rates[plan] || 0;
  }
}
