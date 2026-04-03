/**
 * API Routes - Template Endpoints
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_TEMPLATES } from '../data/seed-templates';

/**
 * GET /api/templates
 * List available proposal templates
 */
export async function listTemplates(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { serviceType } = req.query;

    let templates = DEFAULT_TEMPLATES;
    if (serviceType) {
      templates = templates.filter(t => t.serviceType === serviceType);
    }

    res.status(200).json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/templates/[id]
 * Get single template
 */
export async function getTemplate(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const template = DEFAULT_TEMPLATES.find(t => t.id === id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.status(200).json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
