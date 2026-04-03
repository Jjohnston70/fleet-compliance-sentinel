export declare const PLATFORM_CONFIG: {
    name: string;
    branding: {
        primaryColor: string;
        secondaryColor: string;
    };
    timezone: string;
    supportEmail: string;
    companyName: string;
};
export declare const PRICING_TIERS: {
    free: {
        name: string;
        monthlyPrice: number;
        maxCourses: number;
        maxConsultations: number;
        resourceAccessLevel: "free";
        features: string[];
    };
    basic: {
        name: string;
        monthlyPrice: number;
        maxCourses: number;
        maxConsultations: number;
        resourceAccessLevel: "basic";
        features: string[];
    };
    professional: {
        name: string;
        monthlyPrice: number;
        maxCourses: number;
        maxConsultations: number;
        resourceAccessLevel: "professional";
        features: string[];
    };
    enterprise: {
        name: string;
        monthlyPrice: number;
        maxCourses: number;
        maxConsultations: number;
        resourceAccessLevel: "professional";
        features: string[];
    };
};
export declare const COURSE_CATALOG_RULES: {
    defaultMaxStudents: number;
    minimumModuleDuration: number;
    maximumModuleDuration: number;
};
export declare const WORKSHOP_RULES: {
    maxCapacity: number;
    minCapacity: number;
    registrationDeadlineHours: number;
};
export declare const CERTIFICATE_RULES: {
    numberFormat: (year: number, sequence: number) => string;
    requireMinimumScore: number;
};
export declare const CONSULTATION_RULES: {
    minimumDurationMinutes: number;
    maximumDurationMinutes: number;
    bookingLeadTimeDays: number;
    cancellationDeadlineHours: number;
};
//# sourceMappingURL=index.d.ts.map