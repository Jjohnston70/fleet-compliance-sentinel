/**
 * Proposal Template Seeds - 5 Service Type Templates
 * Default templates for each service type from proposal-gen
 */
export const DEFAULT_TEMPLATES = [
    {
        id: 'tpl-web-dev',
        name: 'Web Development Proposal',
        serviceType: 'Web Development',
        defaultTerms: `
      ## Project Assumptions
      - Requirements are as discussed in meetings
      - Scope changes require formal change orders
      - Client will provide timely feedback and approvals
      - Third-party integrations will be handled by respective vendors
      
      ## Intellectual Property
      All custom code developed is owned by {{CLIENT_COMPANY}} upon final payment.
      
      ## Confidentiality
      Both parties agree to maintain confidentiality of proprietary information.
      
      ## Payment Terms
      As outlined in the Investment & Pricing section.
    `,
        defaultValidityDays: 30,
        active: true,
        sections: [
            {
                id: 'sec-executive-summary',
                title: 'Executive Summary',
                contentTemplate: `
## Executive Summary

This proposal outlines our recommended approach for {{PROJECT_TITLE}} at {{CLIENT_COMPANY}}.

**Project Scope:**
{{PROJECT_DESCRIPTION}}

**Proposed Services:**
- Custom web application development
- Responsive design for all devices
- Integration with existing systems
- Testing and quality assurance
- Deployment and launch support

**Timeline:** {{TIMELINE}}
**Investment:** {{TOTAL_VALUE}}
        `,
                order: 1,
                optional: false,
            },
            {
                id: 'sec-approach',
                title: 'Our Approach',
                contentTemplate: `
## Our Development Approach

### 1. Requirements & Planning
- Detailed requirements gathering
- Technical architecture design
- Project timeline and milestones
- Risk assessment

### 2. Development
- Agile development methodology
- Regular code reviews
- Continuous testing
- Client feedback integration

### 3. Quality Assurance
- Automated testing
- Manual QA testing
- Performance optimization
- Security audit

### 4. Deployment & Support
- Production deployment
- Training and documentation
- Post-launch support
- Performance monitoring
        `,
                order: 2,
                optional: false,
            },
            {
                id: 'sec-deliverables',
                title: 'Deliverables',
                contentTemplate: `
## Deliverables

- Fully functional web application
- Complete source code and documentation
- User and admin documentation
- Training materials
- 30-day post-launch support
        `,
                order: 3,
                optional: false,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'tpl-consulting',
        name: 'Consulting Proposal',
        serviceType: 'Consulting',
        defaultTerms: `
      ## Project Assumptions
      - Client will provide requested information and access
      - Key stakeholders available for interviews
      - Recommendations will be reviewed and discussed
      
      ## Deliverables
      Final report will be delivered in PDF format with presentation.
      
      ## Confidentiality
      All findings and recommendations are confidential.
    `,
        defaultValidityDays: 30,
        active: true,
        sections: [
            {
                id: 'sec-executive-summary',
                title: 'Executive Summary',
                contentTemplate: `
## Executive Summary

{{CLIENT_COMPANY}} has engaged us to {{PROJECT_DESCRIPTION}}

**Scope:**
- Situation assessment
- Root cause analysis
- Strategic recommendations
- Implementation roadmap

**Expected Outcomes:**
- Clear understanding of current state
- Prioritized action items
- Implementation timeline
        `,
                order: 1,
                optional: false,
            },
            {
                id: 'sec-approach',
                title: 'Consulting Approach',
                contentTemplate: `
## Our Consulting Methodology

### Phase 1: Discovery & Assessment
- Stakeholder interviews
- Process documentation review
- Current state analysis
- Gap identification

### Phase 2: Analysis & Recommendations
- Root cause analysis
- Best practice review
- Strategic recommendations
- Implementation priorities

### Phase 3: Planning & Roadmap
- Detailed action plans
- Resource requirements
- Timeline and milestones
- Success metrics
        `,
                order: 2,
                optional: false,
            },
            {
                id: 'sec-deliverables',
                title: 'Deliverables',
                contentTemplate: `
## Deliverables

- Comprehensive assessment report
- Strategic recommendations document
- Implementation roadmap with timeline
- Executive presentation
- Knowledge transfer session
        `,
                order: 3,
                optional: false,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'tpl-design',
        name: 'Design Proposal',
        serviceType: 'Design',
        defaultTerms: `
      ## Design Process
      - Unlimited revision rounds included
      - Feedback provided within 5 business days
      - Final files delivered in multiple formats
      
      ## Intellectual Property
      Design assets are owned by {{CLIENT_COMPANY}} upon final payment.
    `,
        defaultValidityDays: 30,
        active: true,
        sections: [
            {
                id: 'sec-executive-summary',
                title: 'Executive Summary',
                contentTemplate: `
## Executive Summary

We're excited to support {{CLIENT_COMPANY}} with {{PROJECT_TITLE}}.

**Design Scope:**
{{PROJECT_DESCRIPTION}}

**Our Approach:**
- User-centered design methodology
- Modern design principles and trends
- Brand consistency and guidelines
- Iterative feedback and refinement
        `,
                order: 1,
                optional: false,
            },
            {
                id: 'sec-process',
                title: 'Design Process',
                contentTemplate: `
## Our Design Process

### 1. Discovery & Strategy
- Brand audit and analysis
- Target audience research
- Competitive analysis
- Design strategy workshop

### 2. Concept Development
- Wireframes and sketches
- Design concept presentations
- Feedback and revisions
- Design system development

### 3. Refinement & Delivery
- High-fidelity designs
- Design iterations
- Handoff to development
- Design documentation
        `,
                order: 2,
                optional: false,
            },
            {
                id: 'sec-deliverables',
                title: 'Deliverables',
                contentTemplate: `
## Deliverables

- Design system documentation
- Wireframes and mockups
- High-fidelity designs
- Prototype (interactive clickthrough)
- Design specifications
- Brand guidelines update
- Source files (Figma/Adobe)
        `,
                order: 3,
                optional: false,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'tpl-data-analytics',
        name: 'Data Analytics Proposal',
        serviceType: 'Data Analytics',
        defaultTerms: `
      ## Data Assumptions
      - Data will be provided in standard formats
      - Data quality varies and will be assessed
      - Historical data will be cleaned and validated
      
      ## Deliverables
      Analysis reports and dashboards with insights and recommendations.
    `,
        defaultValidityDays: 30,
        active: true,
        sections: [
            {
                id: 'sec-executive-summary',
                title: 'Executive Summary',
                contentTemplate: `
## Executive Summary

This proposal outlines our approach to {{PROJECT_TITLE}} for {{CLIENT_COMPANY}}.

**Analysis Scope:**
{{PROJECT_DESCRIPTION}}

**Deliverables:**
- Current state data analysis
- Key insights and findings
- Actionable recommendations
- Interactive dashboards for monitoring
        `,
                order: 1,
                optional: false,
            },
            {
                id: 'sec-methodology',
                title: 'Analytics Methodology',
                contentTemplate: `
## Our Analytics Approach

### 1. Data Assessment
- Data source evaluation
- Quality assessment
- Completeness analysis
- Integration planning

### 2. Analysis & Insights
- Exploratory data analysis
- Statistical analysis
- Trend identification
- Root cause analysis

### 3. Dashboard Development
- KPI identification
- Dashboard design
- Real-time data integration
- Performance monitoring setup
        `,
                order: 2,
                optional: false,
            },
            {
                id: 'sec-deliverables',
                title: 'Deliverables',
                contentTemplate: `
## Deliverables

- Initial data assessment report
- Comprehensive analysis findings
- Interactive dashboard(s)
- KPI monitoring system
- Monthly insights reports (3 months)
- Training on dashboard usage
- Documentation of methodologies
        `,
                order: 3,
                optional: false,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'tpl-strategy',
        name: 'Strategy Proposal',
        serviceType: 'Strategy',
        defaultTerms: `
      ## Strategic Planning Process
      - Collaborative workshops with leadership
      - Stakeholder interviews and surveys
      - Market and competitive research
      - Executive alignment meetings
      
      ## Deliverables
      Comprehensive strategic plan with implementation roadmap.
    `,
        defaultValidityDays: 30,
        active: true,
        sections: [
            {
                id: 'sec-executive-summary',
                title: 'Executive Summary',
                contentTemplate: `
## Executive Summary

{{CLIENT_COMPANY}} has engaged us to {{PROJECT_TITLE}}.

**Strategic Focus Areas:**
{{PROJECT_DESCRIPTION}}

**Expected Outcomes:**
- Clear strategic direction
- Competitive positioning
- Growth opportunities identified
- Implementation priorities
        `,
                order: 1,
                optional: false,
            },
            {
                id: 'sec-process',
                title: 'Strategic Planning Process',
                contentTemplate: `
## Our Strategy Development Process

### 1. Current State Assessment
- Market analysis and trends
- Competitive landscape review
- Internal capability assessment
- Stakeholder interviews

### 2. Strategy Development
- Vision and mission refinement
- Strategic objectives definition
- Competitive positioning
- Growth opportunities identification

### 3. Implementation Planning
- Strategic initiatives
- Resource allocation
- Timeline and milestones
- Success metrics and KPIs
        `,
                order: 2,
                optional: false,
            },
            {
                id: 'sec-deliverables',
                title: 'Deliverables',
                contentTemplate: `
## Deliverables

- Strategic assessment report
- Market and competitive analysis
- Strategic plan document
- Implementation roadmap
- Executive presentation
- Quarterly strategy review meetings (12 months)
- Strategy communication toolkit
        `,
                order: 3,
                optional: false,
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
