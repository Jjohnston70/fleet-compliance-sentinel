"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSULTATION_RULES = exports.CERTIFICATE_RULES = exports.WORKSHOP_RULES = exports.COURSE_CATALOG_RULES = exports.PRICING_TIERS = exports.PLATFORM_CONFIG = void 0;
exports.PLATFORM_CONFIG = {
    name: 'True North AI Academy',
    branding: {
        primaryColor: '#1a3a5c', // Navy
        secondaryColor: '#3d8eb9', // Teal
    },
    timezone: 'America/New_York',
    supportEmail: 'support@truenorthai.com',
    companyName: 'True North Data Strategies',
};
exports.PRICING_TIERS = {
    free: {
        name: 'Free',
        monthlyPrice: 0,
        maxCourses: 2,
        maxConsultations: 0,
        resourceAccessLevel: 'free',
        features: ['Basic course access', 'Free resources only', 'Community access'],
    },
    basic: {
        name: 'Basic',
        monthlyPrice: 4900,
        maxCourses: -1, // unlimited
        maxConsultations: 0,
        resourceAccessLevel: 'basic',
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
        resourceAccessLevel: 'professional',
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
        resourceAccessLevel: 'professional',
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
exports.COURSE_CATALOG_RULES = {
    defaultMaxStudents: 100,
    minimumModuleDuration: 5, // minutes
    maximumModuleDuration: 480, // 8 hours
};
exports.WORKSHOP_RULES = {
    maxCapacity: 500,
    minCapacity: 5,
    registrationDeadlineHours: 24,
};
exports.CERTIFICATE_RULES = {
    numberFormat: (year, sequence) => `CERT-${year}-${String(sequence).padStart(6, '0')}`,
    requireMinimumScore: 70,
};
exports.CONSULTATION_RULES = {
    minimumDurationMinutes: 30,
    maximumDurationMinutes: 120,
    bookingLeadTimeDays: 2,
    cancellationDeadlineHours: 24,
};
//# sourceMappingURL=index.js.map