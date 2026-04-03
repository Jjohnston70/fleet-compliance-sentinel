import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository.js';
import { StandardDocumentGenerator } from '../src/services/document-generator.js';
import { DocumentType, OnboardingRequestSchema, OnboardingMode } from '../src/data/schema.js';

describe('Document Generator', () => {
  let repo: InMemoryRepository;
  let generator: StandardDocumentGenerator;

  beforeEach(() => {
    repo = new InMemoryRepository();
    generator = new StandardDocumentGenerator(repo);
  });

  it('should generate proposal document', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Test Corp',
      contact_email: 'contact@testcorp.com',
      employees: [
        {
          name: 'John Doe',
          email: 'john@testcorp.com',
          department: 'Engineering',
          role: 'Developer',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    await repo.createRequest(request);

    const doc = await generator.generateDocument(request.id, DocumentType.Proposal, {});

    expect(doc.document_type).toBe(DocumentType.Proposal);
    expect(doc.title).toContain('proposal');
    expect(doc.content_url).toBeDefined();
  });

  it('should render template with variables', async () => {
    const template = 'Client: {{CLIENT_NAME}}, Contact: {{CONTACT_EMAIL}}';
    const data = { CLIENT_NAME: 'Test Client', CONTACT_EMAIL: 'test@example.com' };

    const rendered = generator.renderTemplate(template, data);
    expect(rendered).toContain('Test Client');
    expect(rendered).toContain('test@example.com');
  });

  it('should handle list iteration in templates', async () => {
    const template = '{{#EMPLOYEES}}Employee: {{NAME}} ({{EMAIL}})\\n{{/EMPLOYEES}}';
    const data = {
      EMPLOYEES: [
        { NAME: 'Alice', EMAIL: 'alice@test.com' },
        { NAME: 'Bob', EMAIL: 'bob@test.com' },
      ],
    };

    const rendered = generator.renderTemplate(template, data);
    expect(rendered).toContain('Alice');
    expect(rendered).toContain('Bob');
  });

  it('should generate MSA document', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'MSA Test Corp',
      contact_email: 'msa@testcorp.com',
      employees: [
        {
          name: 'Jane Smith',
          email: 'jane@testcorp.com',
          department: 'Sales',
          role: 'Manager',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    await repo.createRequest(request);

    const doc = await generator.generateDocument(request.id, DocumentType.MSA, {});

    expect(doc.document_type).toBe(DocumentType.MSA);
    expect(doc.title).toContain('MSA');
  });

  it('should generate SOW document with folders', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'SOW Test Corp',
      contact_email: 'sow@testcorp.com',
      employees: [
        {
          name: 'Bob Johnson',
          email: 'bob@testcorp.com',
          department: 'Operations',
          role: 'Coordinator',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    await repo.createRequest(request);

    const doc = await generator.generateDocument(request.id, DocumentType.SOW, {
      folders: ['0-Operations', '1-Contracts', '2-Deliverables'],
    });

    expect(doc.document_type).toBe(DocumentType.SOW);
    expect(doc.title).toContain('SOW');
  });

  it('should generate checklist document', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Checklist Corp',
      contact_email: 'checklist@testcorp.com',
      employees: [
        {
          name: 'Charlie Brown',
          email: 'charlie@testcorp.com',
          department: 'Finance',
          role: 'Accountant',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    await repo.createRequest(request);

    const doc = await generator.generateDocument(request.id, DocumentType.Checklist, {
      folders: ['0-Operations', '1-Contracts'],
    });

    expect(doc.document_type).toBe(DocumentType.Checklist);
  });

  it('should enrich data with request information', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Enrichment Test',
      contact_email: 'enrich@test.com',
      employees: [
        {
          name: 'Employee 1',
          email: 'emp1@test.com',
          department: 'Engineering',
          role: 'Dev',
          license_type: 'standard',
        },
        {
          name: 'Employee 2',
          email: 'emp2@test.com',
          department: 'Sales',
          role: 'Rep',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    await repo.createRequest(request);

    const template = 'Total Employees: {{EMPLOYEE_COUNT}}';
    const rendered = generator.renderTemplate(template, {
      EMPLOYEE_COUNT: request.employees.length,
    });

    expect(rendered).toContain('Total Employees: 2');
  });
});
