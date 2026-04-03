export const PLATFORM_CONFIG = {
  name: 'True North AI Academy',
  branding: {
    primaryColor: '#1a3a5c', // Navy
    secondaryColor: '#3d8eb9', // Teal
  },
  timezone: 'America/New_York',
  supportEmail: 'support@truenorthai.com',
  companyName: 'True North Data Strategies',
};

export const PRICING_TIERS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    maxCourses: 2,
    maxConsultations: 0,
    resourceAccessLevel: 'free' as const,
    features: ['Basic course access', 'Free resources only', 'Community access'],
  },
  basic: {
    name: 'Basic',
    monthlyPrice: 4900,
    maxCourses: -1, // unlimited
    maxConsultations: 0,
    resourceAccessLevel: 'basic' as const,
    features: [
      'All courses',
      'Basic resources',
      'Community access',
      'Certificate generation',
    ],
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 9900,
    maxCourses: -1,
    maxConsultations: 1,
    resourceAccessLevel: 'professional' as const,
    features: [
      'All courses',
      'All resources',
      '1 consultation/month',
      'Priority support',
      'Certificate generation',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 49900,
    maxCourses: -1,
    maxConsultations: -1, // unlimited
    resourceAccessLevel: 'professional' as const,
    features: [
      'Team access',
      'Unlimited consultations',
      'Priority workshops',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced analytics',
    ],
  },
};

export const COURSE_CATALOG_RULES = {
  defaultMaxStudents: 100,
  minimumModuleDuration: 5, // minutes
  maximumModuleDuration: 480, // 8 hours
};

export const WORKSHOP_RULES = {
  maxCapacity: 500,
  minCapacity: 5,
  registrationDeadlineHours: 24,
};

export const CERTIFICATE_RULES = {
  numberFormat: (year: number, sequence: number) =>
    `CERT-${year}-${String(sequence).padStart(6, '0')}`,
  requireMinimumScore: 70,
};

export const CONSULTATION_RULES = {
  minimumDurationMinutes: 30,
  maximumDurationMinutes: 120,
  bookingLeadTimeDays: 2,
  cancellationDeadlineHours: 24,
};
