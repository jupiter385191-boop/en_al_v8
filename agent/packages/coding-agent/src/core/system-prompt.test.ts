import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./system-prompt.js";

const createdDirs: string[] = [];

function createTempProject(): string {
	const dir = mkdtempSync(join(tmpdir(), "pi-system-prompt-"));
	createdDirs.push(dir);
	return dir;
}

afterEach(() => {
	for (const dir of createdDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe("buildSystemPrompt", () => {
	it("adds a fallback placement hint for bare filenames", () => {
		const projectDir = createTempProject();
		mkdirSync(join(projectDir, "src"), { recursive: true });

		const prompt = buildSystemPrompt({
			cwd: projectDir,
			customPrompt: "Create `foo.py`.\nRequirements:\n- add a helper",
		});

		expect(prompt).toContain("NEW FILE PLACEMENT hint");
		expect(prompt).toContain("- foo.py -> src/foo.py");
	});

	it("prefers the directory of an explicitly named file", () => {
		const projectDir = createTempProject();
		mkdirSync(join(projectDir, "app"), { recursive: true });
		writeFileSync(join(projectDir, "app", "existing.ts"), "export const existing = true;\n", "utf8");

		const prompt = buildSystemPrompt({
			cwd: projectDir,
			customPrompt: "Update `app/existing.ts` and create `foo.py`.\nRequirements:\n- wire it in",
		});

		expect(prompt).toContain("FILES EXPLICITLY NAMED IN THE TASK");
		expect(prompt).toContain("- foo.py -> app/foo.py");
	});
});
