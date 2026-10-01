import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const server = readFileSync(join(root, "src/server.ts"), "utf8");
const manifest = JSON.parse(readFileSync(join(root, "plugin.json"), "utf8"));
const legacy = JSON.parse(readFileSync(join(root, "manifest/plugin.json"), "utf8"));

describe("OpenAI compliance guardrails", () => {
  it("uses the current portable Agent Plugins manifest schema", () => {
    expect(manifest.$schema).toBe("https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
    expect(manifest.name).toBe("startup-survival-score");
  });

  it("keeps pricing and upgrade promotion out of submission manifests", () => {
    const canonical = JSON.stringify(manifest).toLowerCase();
    const deprecated = JSON.stringify(legacy).toLowerCase();
    for (const word of ["pricing", "upgrade now", "checkout", "discount"]) {
      expect(canonical).not.toContain(word);
      expect(deprecated).not.toContain(word);
    }
  });

  it("marks the old manifest as deprecated internal metadata", () => {
    expect(legacy.status).toBe("deprecated-internal-project-metadata");
    expect(legacy.canonical_manifest).toBe("../plugin.json");
  });

  it("keeps the entire public server free of credential fields", () => {
    const source = server.toLowerCase();
    expect(source).not.toContain("licensekey");
    expect(source).not.toContain("x-sss-license");
    expect(source).not.toContain("apikey");
    expect(source).not.toContain("password");
  });

  it("exposes only the complete anonymous calculation tool before OAuth exists", () => {
    expect((server.match(/registerAppTool\(/g) || []).length).toBe(1);
    expect(server).toContain('registerAppTool(server,"calculate_sss"');
  });

  it("sets explicit safety annotations on every registered app tool", () => {
    const toolCount = (server.match(/registerAppTool\(/g) || []).length;
    const annotations = (server.match(/annotations:\{readOnlyHint:true,destructiveHint:false,openWorldHint:false\}/g) || []).length;
    expect(toolCount).toBeGreaterThan(0);
    expect(annotations).toBe(toolCount);
  });

  it("does not log request bodies or financial input objects", () => {
    expect(server).not.toMatch(/console\.(log|error|warn)\s*\(\s*(body|args|input|raw)\b/);
    expect(server).not.toMatch(/JSON\.stringify\s*\(\s*(body|args|input|raw)\b/);
  });
});
