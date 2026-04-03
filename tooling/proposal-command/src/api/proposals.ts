/**
 * API Routes - Proposal Endpoints
 * POST /api/proposals - Create proposal
 * GET /api/proposals - List proposals
 * GET /api/proposals/[id] - Get single proposal
 * PUT /api/proposals/[id] - Update proposal
 * POST /api/proposals/[id]/send - Send proposal email
 * GET /api/proposals/[id]/track - Tracking pixel / view confirmation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ProposalService } from '../services/proposal-service';
import { ClientService } from '../services/client-service';
import { PricingService } from '../services/pricing-service';
import { EmailService } from '../services/email-service';
import { PDFGenerator } from '../services/pdf-generator';
import { InMemoryRepository } from '../data/in-memory-repository';
import { DEFAULT_TEMPLATES } from '../data/seed-templates';

// Initialize services (in production, use Firestore instance)
const repo = new InMemoryRepository();
const proposalService = new ProposalService(repo);
const clientService = new ClientService(repo);
const pricingService = new PricingService(repo);
const emailService = new EmailService();

/**
 * POST /api/proposals
 * Create a new proposal
 */
export async function createProposal(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      clientName,
      clientCompany,
      clientEmail,
      projectTitle,
      projectDescription,
      serviceType,
      lineItems,
      validityDays = 30,
    } = req.body;

    // Validate required fields
    if (!clientCompany || !clientName || !clientEmail || !projectTitle || !serviceType) {
      return res.status(400).json({
        error: 'Missing required fields: clientCompany, clientName, clientEmail, projectTitle, serviceType',
      });
    }

    // Get or create client
    const client = await clientService.getOrCreateClient({
      companyName: clientCompany,
      contactName: clientName,
      email: clientEmail,
    });

    // Get template
    const template = DEFAULT_TEMPLATES.find(t => t.serviceType === serviceType);
    if (!template) {
      return res.status(404).json({ error: `No template found for service type: ${serviceType}` });
    }

    // Calculate total from line items
    const total = Array.isArray(lineItems)
      ? lineItems.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
      : 0;

    // Create proposal
    const proposal = await proposalService.createProposal(
      client.id,
      template.id,
      projectTitle,
      projectDescription || '',
      total,
      validityDays
    );

    // Update service type
    proposal.serviceType = serviceType as any;
    await repo.saveProposal(proposal);

    // Add line items
    if (Array.isArray(lineItems)) {
      await pricingService.addLineItems(
        proposal.id,
        lineItems.map((item: any, index: number) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: item.category || 'Other',
        }))
      );
    }

    res.status(201).json({
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      status: proposal.status,
      clientId: client.id,
      createdAt: proposal.createdAt,
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
}

/**
 * GET /api/proposals
 * List all proposals with optional filters
 */
export async function listProposals(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientId, status } = req.query;

    const proposals = await proposalService.listProposals({
      clientId: clientId as string,
      status: status as any,
    });

    res.status(200).json(proposals);
  } catch (error) {
    console.error('Error listing proposals:', error);
    res.status(500).json({ error: 'Failed to list proposals' });
  }
}

/**
 * GET /api/proposals/[id]
 * Get single proposal with line items
 */
export async function getProposal(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const proposal = await proposalService.getProposal(id as string);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const lineItems = await pricingService.getLineItems(proposal.id);
    const summary = await pricingService.calculatePricingSummary(proposal.id);

    res.status(200).json({
      ...proposal,
      lineItems,
      pricingSummary: summary,
    });
  } catch (error) {
    console.error('Error getting proposal:', error);
    res.status(500).json({ error: 'Failed to get proposal' });
  }
}

/**
 * PUT /api/proposals/[id]
 * Update proposal
 */
export async function updateProposal(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const updates = req.body;

    const updated = await proposalService.updateProposal(id as string, updates);

    res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: error.message || 'Failed to update proposal' });
  }
}

/**
 * POST /api/proposals/[id]/send
 * Generate PDF and send proposal email
 */
export async function sendProposal(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const proposal = await proposalService.getProposal(id as string);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const client = await clientService.getClient(proposal.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const template = DEFAULT_TEMPLATES.find(t => t.id === proposal.templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const lineItems = await pricingService.getLineItems(proposal.id);
    const summary = await pricingService.calculatePricingSummary(proposal.id);

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generateDocx(
      proposal,
      template,
      client.contactName,
      client.companyName,
      lineItems,
      summary.subtotal,
      summary.taxAmount,
      summary.discountAmount,
      summary.total
    );

    // Create email payload
    const emailPayload = EmailService.createProposalEmailPayload(
      client.email,
      client.contactName,
      proposal.title,
      client.companyName,
      pdfBuffer,
      proposal.proposalNumber
    );

    // Send email
    const emailResult = await emailService.sendProposalEmail(emailPayload);

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send email' });
    }

    // Mark as sent
    await proposalService.markAsSent(proposal.id);

    res.status(200).json({
      success: true,
      messageId: emailResult.messageId,
      proposal: await proposalService.getProposal(proposal.id),
    });
  } catch (error: any) {
    console.error('Error sending proposal:', error);
    res.status(500).json({ error: error.message || 'Failed to send proposal' });
  }
}

/**
 * GET /api/proposals/[id]/track
 * Tracking pixel / view confirmation
 */
export async function trackProposal(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    const proposal = await proposalService.getProposal(id as string);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Mark as viewed
    await proposalService.markAsViewed(proposal.id);

    // Return 1x1 transparent pixel
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.status(200).send(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      )
    );
  } catch (error) {
    console.error('Error tracking proposal:', error);
    res.status(500).json({ error: 'Failed to track proposal' });
  }
}
