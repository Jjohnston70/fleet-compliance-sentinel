/**
 * Next.js API Route Handlers
 * Provides Express-style middleware compatible handlers for Vercel deployment
 *
 * Usage in pages/api/compliance/[action].ts:
 *   import { handleComplianceRequest } from '@/src/api/next-handler';
 *   export default handleComplianceRequest;
 *
 * Note: Next.js types are optional for testing. In production, add next to devDependencies.
 */

import type { ApiResponse } from "./router.js";
import { handleGet, handlePost } from "./router.js";

// Type stubs for cases where next is not installed
type NextApiRequest = Record<string, unknown> & {
  method?: string;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

type NextApiResponse<T = unknown> = {
  setHeader(key: string, value: string): NextApiResponse<T>;
  status(code: number): NextApiResponse<T>;
  json(data: T): void;
  end(): void;
};

export async function handleComplianceRequest(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  // CORS headers
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "POST") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const result = await handlePost(body);
      res.status(result.success ? 200 : 400).json(result);
    } else if (req.method === "GET") {
      const action = ((req.query?.action) as string) ?? "meta";
      const result = handleGet(action);
      res.status(result.success ? 200 : 405).json(result);
    } else {
      res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
}

/**
 * Individual endpoint handlers for modular routing
 */
export async function handleSubmitCompanyInfo(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const result = await handlePost({ action: "submitCompanyInfo", data: req.body });
  res.status(result.success ? 200 : 400).json(result);
}

export async function handleGeneratePackage(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const result = await handlePost({ action: "generatePackage", data: req.body });
  res.status(result.success ? 200 : 400).json(result);
}

export async function handleGenerateAll(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const result = await handlePost({ action: "generateAll", data: req.body });
  res.status(result.success ? 200 : 400).json(result);
}

export async function handleGetCompanyInfo(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const result = await handlePost({ action: "getCompanyInfo", data: req.body });
  res.status(result.success ? 200 : 400).json(result);
}

export async function handleListCompanies(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const result = await handlePost({ action: "listCompanies", data: {} });
  res.status(result.success ? 200 : 400).json(result);
}

export async function handleGetPackageStatus(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  const result = await handlePost({ action: "getPackageStatus", data: req.body });
  res.status(result.success ? 200 : 400).json(result);
}
