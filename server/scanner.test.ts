import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("scanner procedures", () => {
  it("reports the supplied Python detector engine as online", async () => {
    const result = await appRouter.createCaller(createContext()).scanner.health();
    expect(result).toMatchObject({ status: "online", engine: "python_backend/detector.engine", masking: "immediate" });
  });

  it("returns masked findings from the live detector bridge", async () => {
    const result = await appRouter.createCaller(createContext()).scanner.scan({
      source: 'API_KEY = "replace-with-a-real-secret"',
      filename: "config.py",
      repoName: "test/repo",
    });

    expect(result.files_scanned).toBe(1);
    expect(result.summary.findings).toBe(1);
    expect(result.summary.blocked).toBe(true);
    expect(result.findings[0]).toMatchObject({
      file_path: "config.py",
      secret_type: "Possible API credential",
      masked_value: "repl******************cret",
      commit_blocked: true,
    });
    expect(result.findings[0]?.masked_value).not.toContain("replace-with-a-real-secret");
  });
});
