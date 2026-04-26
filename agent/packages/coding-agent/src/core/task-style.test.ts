import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { applyTaskStyleToChangedFiles } from "./task-style.js";

const createdDirs: string[] = [];

function createGitRepo(): string {
	const dir = mkdtempSync(join(tmpdir(), "pi-task-style-"));
	createdDirs.push(dir);
	execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
	return dir;
}

afterEach(() => {
	delete process.env.PI_TASK_STYLE;
	for (const dir of createdDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe("applyTaskStyleToChangedFiles", () => {
	it("styles source files and skips non-source files", async () => {
		process.env.PI_TASK_STYLE = "between-lines";
		const repoDir = createGitRepo();
		const sourcePath = join(repoDir, "demo.ts");
		const packageJsonPath = join(repoDir, "package.json");

		writeFileSync(sourcePath, "const value = 1;\nconsole.log(value);\n", "utf8");
		writeFileSync(packageJsonPath, '{\n  "name": "demo"\n}\n', "utf8");

		const result = await applyTaskStyleToChangedFiles(repoDir);

		expect(readFileSync(sourcePath, "utf8")).toBe("const value = 1;\n\nconsole.log(value);\n");
		expect(readFileSync(packageJsonPath, "utf8")).toBe('{\n  "name": "demo"\n}\n');
		expect(result.enabled).toBe(true);
		expect(result.styledFiles).toBe(1);
		expect(result.skippedFiles).toBe(1);
	});

	it("returns disabled when the task style mode is off", async () => {
		process.env.PI_TASK_STYLE = "off";
		const repoDir = createGitRepo();
		writeFileSync(join(repoDir, "demo.ts"), "const value = 1;\n", "utf8");

		const result = await applyTaskStyleToChangedFiles(repoDir);

		expect(result).toEqual({
			enabled: false,
			mode: "off",
			scannedFiles: 0,
			styledFiles: 0,
			skippedFiles: 0,
		});
		expect(readFileSync(join(repoDir, "demo.ts"), "utf8")).toBe("const value = 1;\n");
	});
});
