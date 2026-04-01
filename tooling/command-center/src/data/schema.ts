/**
 * Data schema definitions for Command Center
 */

import { z } from 'zod';

// Tool parameter schema
export const ParameterSchemaZ = z.object({
  type: z.literal('object'),
  properties: z.record(z.any()),
  required: z.array(z.string()).optional(),
});

export type ParameterSchema = z.infer<typeof ParameterSchemaZ>;

// Tool definition
export const ToolDefinitionZ = z.object({
  name: z.string(),
  description: z.string(),
  parameters: ParameterSchemaZ,
});

export type ToolDefinition = z.infer<typeof ToolDefinitionZ>;

// Module health
export const ModuleHealthZ = z.object({
  status: z.enum(['healthy', 'degraded', 'error', 'offline']),
  lastCheck: z.number(), // timestamp
  responseTimeMs: z.number().optional(),
  error: z.string().optional(),
});

export type ModuleHealth = z.infer<typeof ModuleHealthZ>;

// Registered module
export const RegisteredModuleZ = z.object({
  id: z.string(),
  displayName: z.string(),
  version: z.string(),
  description: z.string(),
  classification: z.enum(['Operations', 'Finance', 'Intelligence', 'Planning', 'Infrastructure', 'Logistics']),
  status: z.enum(['active', 'inactive', 'error', 'maintenance']),
  toolCount: z.number(),
  tools: z.array(ToolDefinitionZ),
  health: ModuleHealthZ,
  baseUrl: z.string().optional(),
  registeredAt: z.number(),
  updatedAt: z.number(),
});

export type RegisteredModule = z.infer<typeof RegisteredModuleZ>;

// Tool invocation record
export const ToolInvocationZ = z.object({
  id: z.string(),
  toolId: z.string(),
  moduleId: z.string(),
  input: z.record(z.any()),
  output: z.record(z.any()).optional(),
  status: z.enum(['success', 'error', 'timeout']),
  durationMs: z.number(),
  invokedAt: z.number(),
  errorMessage: z.string().optional(),
});

export type ToolInvocation = z.infer<typeof ToolInvocationZ>;

// System config
export const SystemConfigZ = z.object({
  id: z.string(),
  modulesPath: z.string(),
  autoDiscoveryEnabled: z.boolean(),
  healthCheckIntervalMs: z.number(),
  defaultTimeoutMs: z.number(),
  updatedAt: z.number(),
});

export type SystemConfig = z.infer<typeof SystemConfigZ>;
