import { spawn } from "node:child_process";
import path from "node:path";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const scanInput = z.object({
  source: z.string().max(250_000),
  filename: z.string().min(1).max(200).default("workspace.env"),
  repoName: z.string().min(1).max(120).default("local-workspace"),
});

type DetectorFinding = {
  file_path: string;
  line_number: number;
  secret_type: string;
  masked_value: string;
  confidence: "HIGH" | "MEDIUM";
  regex_matched: boolean;
  entropy_score: number;
  repo_name: string;
  commit_blocked: boolean;
  detected_at: string;
};

function runDetector(input: z.infer<typeof scanInput>): Promise<{ findings: DetectorFinding[]; files_scanned: number }> {
  return new Promise((resolve, reject) => {
    const projectRoot = process.cwd();
    const script = path.join(projectRoot, "scripts", "scan_payload.py");
    const child = spawn("python3", [script], {
      cwd: projectRoot,
      env: { ...process.env, PYTHONPATH: path.join(projectRoot, "python_backend") },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("error", error => reject(error));
    child.on("close", code => {
      if (code !== 0) {
        reject(new Error(stderr || `Detector exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout) as { findings: DetectorFinding[]; files_scanned: number });
      } catch {
        reject(new Error("Detector returned an invalid response"));
      }
    });
    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  scanner: router({
    health: publicProcedure.query(() => ({ status: "online", engine: "python_backend/detector.engine", masking: "immediate" })),
    scan: publicProcedure.input(scanInput).mutation(async ({ input }) => {
      const result = await runDetector(input);
      const high = result.findings.filter(item => item.confidence === "HIGH").length;
      const medium = result.findings.filter(item => item.confidence === "MEDIUM").length;
      return {
        ...result,
        summary: {
          findings: result.findings.length,
          high,
          medium,
          blocked: result.findings.length > 0,
          clean: result.findings.length === 0,
        },
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
