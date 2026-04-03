export type TaskCommandConfig = {
  defaultTimezone: string;
  defaultPriority: "critical" | "high" | "medium" | "low";
  staleDays: number;
  nodeEnv: "development" | "production" | "test";
  port: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): TaskCommandConfig {
  const nodeEnv = env.NODE_ENV ?? "development";
  const port = env.PORT ? parseInt(env.PORT, 10) : 3000;

  return {
    defaultTimezone: env.DEFAULT_TIMEZONE ?? "America/Denver",
    defaultPriority: (env.DEFAULT_PRIORITY ?? "medium") as any,
    staleDays: env.STALE_TASK_DAYS ? parseInt(env.STALE_TASK_DAYS, 10) : 7,
    nodeEnv: nodeEnv as any,
    port,
  };
}
