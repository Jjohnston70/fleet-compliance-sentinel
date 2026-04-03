/**
 * API Routes - Client Endpoints
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ClientService } from '../services/client-service';
import { InMemoryRepository } from '../data/in-memory-repository';

const repo = new InMemoryRepository();
const clientService = new ClientService(repo);

/**
 * POST /api/clients
 * Create new client
 */
export async function createClient(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyName, contactName, email, phone, industry } = req.body;

    if (!companyName || !contactName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await clientService.createClient({
      companyName,
      contactName,
      email,
      phone,
      industry,
    });

    res.status(201).json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/clients
 * List all clients
 */
export async function listClients(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clients = await clientService.listClients();
    res.status(200).json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/clients/[id]
 */
export async function getClient(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const client = await clientService.getClient(id as string);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /api/clients/[id]
 */
export async function updateClient(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const updates = req.body;

    const client = await clientService.updateClient(id as string, updates);
    res.status(200).json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
