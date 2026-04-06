
export type Tier = 'free' | 'low-cost' | 'battle-tested';
export type Protocol = 'direction' | 'command';

export interface Prompt {
  id: string;
  role: string;
  tier: Tier;
  category: string;
  protocol: Protocol;
  intent: string[];
  system_prompt: string;
  variables?: string[];
}

export function validatePrompt(prompt: Prompt): void {
  if (!prompt.id || !prompt.role || !prompt.protocol) {
    throw new Error('Invalid prompt: missing required fields');
  }
  if (!['direction', 'command'].includes(prompt.protocol)) {
    throw new Error('Invalid protocol');
  }
}
