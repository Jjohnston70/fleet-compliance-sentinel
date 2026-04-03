import { Consultation } from '../data/schema';
import { IRepository } from '../data/repository';
import { CONSULTATION_RULES, PRICING_TIERS } from '../config/index';

type ConsultationStatusType = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export class ConsultationService {
  constructor(private repo: IRepository) {}

  async bookConsultation(
    studentId: string,
    consultantId: string,
    type: 'one_on_one' | 'team' | 'assessment_review',
    date: Date,
    startTime: string, // HH:MM
    endTime: string, // HH:MM
    timezone: string
  ): Promise<Consultation> {
    const student = await this.repo.getStudent(studentId);
    if (!student) throw new Error(`Student ${studentId} not found`);

    // Check plan allows consultations
    const pricingTier = PRICING_TIERS[student.plan];
    if (pricingTier.maxConsultations === 0) {
      throw new Error(
        `${student.plan} plan does not include consultation access`
      );
    }

    // Check booking lead time
    const now = new Date();
    const bookingDate = new Date(date);
    const daysDifference = Math.floor(
      (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference < CONSULTATION_RULES.bookingLeadTimeDays) {
      throw new Error(
        `Consultations must be booked at least ${CONSULTATION_RULES.bookingLeadTimeDays} days in advance`
      );
    }

    // Validate time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;

    if (
      durationMinutes < CONSULTATION_RULES.minimumDurationMinutes ||
      durationMinutes > CONSULTATION_RULES.maximumDurationMinutes
    ) {
      throw new Error(
        `Consultation duration must be between ${CONSULTATION_RULES.minimumDurationMinutes} and ${CONSULTATION_RULES.maximumDurationMinutes} minutes`
      );
    }

    // Check for conflicts
    const conflicts = await this.repo.listConsultations({
      status: 'scheduled',
    });

    const hasConflict = conflicts.some((c) => {
      if (c.consultant_id !== consultantId) return false;
      if (c.date.toDateString() !== date.toDateString()) return false;
      const [cStart] = c.start_time.split(':').map(Number);
      const [cEnd] = c.end_time.split(':').map(Number);
      const cStartMin = cStart * 60;
      const cEndMin = cEnd * 60;

      return !(endMinutes <= cStartMin || startMinutes >= cEndMin);
    });

    if (hasConflict) {
      throw new Error('Consultant has scheduling conflict at this time');
    }

    // Check monthly limit
    if (pricingTier.maxConsultations !== -1) {
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      const thisMonthConsultations = await this.repo.listConsultations({
        studentId,
        status: 'completed',
      });

      const thisMonthCount = thisMonthConsultations.filter((c) =>
        c.created_at >= monthStart
      ).length;

      if (thisMonthCount >= pricingTier.maxConsultations) {
        throw new Error(
          `${student.plan} plan allows ${pricingTier.maxConsultations} consultations per month`
        );
      }
    }

    const consultation: Consultation = {
      id: crypto.randomUUID(),
      student_id: studentId,
      consultant_id: consultantId,
      type,
      date,
      start_time: startTime,
      end_time: endTime,
      timezone,
      status: 'scheduled' as ConsultationStatusType,
      notes: '',
      follow_up_actions: [],
      price_cents: this.calculatePrice(type),
      created_at: new Date(),
    };

    return this.repo.createConsultation(consultation);
  }

  async getConsultation(id: string): Promise<Consultation | null> {
    return this.repo.getConsultation(id);
  }

  async listStudentConsultations(
    studentId: string,
    filters?: { status?: string }
  ): Promise<Consultation[]> {
    return this.repo.listConsultations({
      studentId,
      status: filters?.status,
    });
  }

  async cancelConsultation(id: string): Promise<Consultation> {
    const consultation = await this.repo.getConsultation(id);
    if (!consultation) throw new Error(`Consultation ${id} not found`);

    if (consultation.status !== 'scheduled') {
      throw new Error('Only scheduled consultations can be cancelled');
    }

    const now = new Date();
    const consultationDate = new Date(consultation.date);
    const hoursUntil =
      (consultationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < CONSULTATION_RULES.cancellationDeadlineHours) {
      throw new Error(
        `Consultations must be cancelled at least ${CONSULTATION_RULES.cancellationDeadlineHours} hours in advance`
      );
    }

    return this.repo.updateConsultation(id, {
      status: 'cancelled' as ConsultationStatusType,
    });
  }

  async completeConsultation(
    id: string,
    notes: string,
    followUpActions: string[] = []
  ): Promise<Consultation> {
    const consultation = await this.repo.getConsultation(id);
    if (!consultation) throw new Error(`Consultation ${id} not found`);

    return this.repo.updateConsultation(id, {
      status: 'completed' as ConsultationStatusType,
      notes,
      follow_up_actions: followUpActions,
    });
  }

  private calculatePrice(type: string): number {
    const prices: Record<string, number> = {
      one_on_one: 19900, // $199
      team: 49900, // $499
      assessment_review: 9900, // $99
    };

    return prices[type] || 0;
  }
}
