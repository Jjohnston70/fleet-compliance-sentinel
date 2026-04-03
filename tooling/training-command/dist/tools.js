"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAINING_COMMAND_TOOLS = void 0;
exports.createToolDefinitions = createToolDefinitions;
exports.createToolHandlers = createToolHandlers;
const handlers_1 = require("./api/handlers");
function createToolDefinitions() {
    return [
        {
            name: 'list_courses',
            description: 'List available training courses with optional filters by category or level',
            input_schema: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        description: 'Filter by category (ai_fundamentals, data_strategy, automation, industry_specific, leadership)',
                    },
                    level: {
                        type: 'string',
                        description: 'Filter by difficulty level (beginner, intermediate, advanced)',
                    },
                },
                required: [],
            },
        },
        {
            name: 'get_course',
            description: 'Get detailed information about a specific course',
            input_schema: {
                type: 'object',
                properties: {
                    courseId: {
                        type: 'string',
                        description: 'The unique course ID',
                    },
                },
                required: ['courseId'],
            },
        },
        {
            name: 'enroll_student',
            description: 'Enroll a student in a course',
            input_schema: {
                type: 'object',
                properties: {
                    studentId: {
                        type: 'string',
                        description: 'The student ID',
                    },
                    courseId: {
                        type: 'string',
                        description: 'The course ID to enroll in',
                    },
                },
                required: ['studentId', 'courseId'],
            },
        },
        {
            name: 'get_student_progress',
            description: 'Get progress summary for a student enrollment',
            input_schema: {
                type: 'object',
                properties: {
                    enrollmentId: {
                        type: 'string',
                        description: 'The enrollment ID',
                    },
                },
                required: ['enrollmentId'],
            },
        },
        {
            name: 'get_course_recommendations',
            description: 'Get personalized course recommendations for a student',
            input_schema: {
                type: 'object',
                properties: {
                    studentId: {
                        type: 'string',
                        description: 'The student ID',
                    },
                    basedOnRole: {
                        type: 'boolean',
                        description: 'Recommend based on student role',
                    },
                },
                required: ['studentId'],
            },
        },
        {
            name: 'book_consultation',
            description: 'Book a consultation session with an AI expert',
            input_schema: {
                type: 'object',
                properties: {
                    studentId: {
                        type: 'string',
                        description: 'The student ID',
                    },
                    consultantId: {
                        type: 'string',
                        description: 'The consultant ID',
                    },
                    type: {
                        type: 'string',
                        description: 'Consultation type (one_on_one, team, assessment_review)',
                    },
                    date: {
                        type: 'string',
                        description: 'Date in ISO format',
                    },
                    startTime: {
                        type: 'string',
                        description: 'Start time (HH:MM)',
                    },
                    endTime: {
                        type: 'string',
                        description: 'End time (HH:MM)',
                    },
                    timezone: {
                        type: 'string',
                        description: 'Timezone (e.g., America/New_York)',
                    },
                },
                required: [
                    'studentId',
                    'consultantId',
                    'type',
                    'date',
                    'startTime',
                    'endTime',
                    'timezone',
                ],
            },
        },
        {
            name: 'list_workshops',
            description: 'List available live workshops',
            input_schema: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        description: 'Filter by status (scheduled, live, completed, cancelled)',
                    },
                },
                required: [],
            },
        },
        {
            name: 'register_for_workshop',
            description: 'Register a student for a workshop',
            input_schema: {
                type: 'object',
                properties: {
                    workshopId: {
                        type: 'string',
                        description: 'The workshop ID',
                    },
                    studentId: {
                        type: 'string',
                        description: 'The student ID',
                    },
                },
                required: ['workshopId', 'studentId'],
            },
        },
        {
            name: 'get_student_dashboard',
            description: 'Get complete dashboard data for a student',
            input_schema: {
                type: 'object',
                properties: {
                    studentId: {
                        type: 'string',
                        description: 'The student ID',
                    },
                },
                required: ['studentId'],
            },
        },
        {
            name: 'issue_certificate',
            description: 'Issue a completion certificate for a student',
            input_schema: {
                type: 'object',
                properties: {
                    studentId: {
                        type: 'string',
                        description: 'The student ID',
                    },
                    courseId: {
                        type: 'string',
                        description: 'The course ID',
                    },
                    courseTitle: {
                        type: 'string',
                        description: 'The course title',
                    },
                },
                required: ['studentId', 'courseId', 'courseTitle'],
            },
        },
        {
            name: 'get_course_analytics',
            description: 'Get analytics and performance metrics for a course',
            input_schema: {
                type: 'object',
                properties: {
                    courseId: {
                        type: 'string',
                        description: 'The course ID',
                    },
                },
                required: ['courseId'],
            },
        },
    ];
}
function createToolHandlers(repo) {
    const handlers = new handlers_1.APIHandlers(repo);
    return {
        list_courses: async (input) => handlers.listCourses({
            category: input.category,
            level: input.level,
        }),
        get_course: async (input) => handlers.getCourse(input.courseId),
        enroll_student: async (input) => handlers.enrollStudent(input.studentId, input.courseId),
        get_student_progress: async (input) => handlers.getProgressSummary(input.enrollmentId),
        get_course_recommendations: async (input) => {
            const stats = await handlers.getStudentStats(input.studentId);
            // In a real system, use ML to recommend courses
            const courses = await handlers.listCourses();
            return {
                recommendations: courses.slice(0, 3),
                stats,
            };
        },
        book_consultation: async (input) => handlers.bookConsultation(input.studentId, input.consultantId, input.type, new Date(input.date), input.startTime, input.endTime, input.timezone),
        list_workshops: async (input) => handlers.listWorkshops({ status: input.status }),
        register_for_workshop: async (input) => handlers.registerForWorkshop(input.workshopId, input.studentId),
        get_student_dashboard: async (input) => handlers.getStudentDashboard(input.studentId),
        issue_certificate: async (input) => handlers.issueCertificate(input.studentId, input.courseId, input.courseTitle),
        get_course_analytics: async (input) => {
            // This would require the CourseAnalytics service to be properly initialized
            return { courseId: input.courseId, status: 'Analytics data available' };
        },
    };
}
exports.TRAINING_COMMAND_TOOLS = createToolDefinitions();
//# sourceMappingURL=tools.js.map