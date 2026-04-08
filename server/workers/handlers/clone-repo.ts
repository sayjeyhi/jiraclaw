import { execFile } from "node:child_process";
import { chmod, mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { prisma } from "../../db";
import type { ProjectCloneRepoPayload } from "@/lib/rabbitmq";

const execFileAsync = promisify(execFile);

const REPOS_BASE_PATH = process.env.REPOS_PATH ?? path.join(process.cwd(), ".repos");

const CLONE_TIMEOUT_MS = 5 * 60 * 1000;

// Only UUID-like strings (hex + hyphens, 8–64 chars) are safe as path segments.
const SAFE_ID_RE = /^[0-9a-f-]{8,64}$/i;

function assertSafeId(id: string, label: string): void {
  if (!SAFE_ID_RE.test(id)) throw new Error(`Unsafe ${label}: ${JSON.stringify(id)}`);
}

const ALLOWED_GIT_HOSTS = ["github.com", "gitlab.com", "bitbucket.org"];

function assertSafeUrl(rawUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid repository URL: ${JSON.stringify(rawUrl)}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`Disallowed URL protocol "${parsed.protocol}" — only https: is allowed`);
  }
  const hostname = parsed.hostname.toLowerCase();
  const allowed = ALLOWED_GIT_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  if (!allowed) {
    throw new Error(`Disallowed git host "${hostname}" — allowed: ${ALLOWED_GIT_HOSTS.join(", ")}`);
  }
}

function assertConfinedPath(repoDir: string): void {
  const base = path.resolve(REPOS_BASE_PATH) + path.sep;
  const resolved = path.resolve(repoDir);
  if (!resolved.startsWith(base)) {
    throw new Error(`Path traversal detected: ${resolved} is outside ${base}`);
  }
}

export async function handleCloneRepo(payload: ProjectCloneRepoPayload): Promise<void> {
  const { projectId, workspaceId } = payload;

  assertSafeId(workspaceId, "workspaceId");
  assertSafeId(projectId, "projectId");

  const project = await prisma.jiraProject.findFirst({
    where: { id: projectId, workspaceId },
  });
  if (!project) throw new Error(`Project not found: ${projectId}`);

  const repositories = project.repositories as Array<{
    id: string;
    name: string;
    url: string;
    branch: string;
    status: string;
  }>;

  if (!repositories?.length) {
    console.log(`[clone-repo] No repositories on project ${projectId}, skipping`);
    return;
  }

  const updatedRepos = [...repositories];

  for (let i = 0; i < updatedRepos.length; i++) {
    const repo = updatedRepos[i];
    if (repo.status === "cloned") {
      console.log(`[clone-repo] Repo ${repo.name} already cloned, skipping`);
      continue;
    }

    assertSafeId(repo.id, "repo.id");
    assertSafeUrl(repo.url);

    const repoDir = path.join(REPOS_BASE_PATH, workspaceId, projectId, repo.id);
    assertConfinedPath(repoDir);

    try {
      console.log(`[clone-repo] Cloning ${repo.url} (branch: ${repo.branch}) → ${repoDir}`);
      await mkdir(repoDir, { recursive: true });
      // Restrict each workspace directory so only the owning process can read it.
      await chmod(repoDir, 0o700);

      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), CLONE_TIMEOUT_MS);

      try {
        await execFileAsync(
          "git",
          [
            "-c",
            "protocol.file.allow=never",
            "-c",
            "protocol.allow=never",
            "-c",
            "protocol.https.allow=always",
            "clone",
            "--branch",
            repo.branch,
            "--depth",
            "1",
            repo.url,
            repoDir,
          ],
          { signal: ac.signal },
        );
      } finally {
        clearTimeout(timer);
      }

      updatedRepos[i] = { ...repo, status: "cloned" };
      console.log(`[clone-repo] Successfully cloned ${repo.name}`);
    } catch (err) {
      console.error(`[clone-repo] Failed to clone ${repo.name}:`, err);
      updatedRepos[i] = { ...repo, status: "error" };
    }
  }

  const allCloned = updatedRepos.every((r) => r.status === "cloned");
  const anyError = updatedRepos.some((r) => r.status === "error");

  await prisma.jiraProject.update({
    where: { id: projectId },
    data: {
      repositories: updatedRepos,
      status: allCloned ? "connected" : anyError ? "error" : "syncing",
    },
  });

  console.log(
    `[clone-repo] Project ${projectId} updated — status: ${allCloned ? "connected" : anyError ? "error" : "syncing"}`,
  );
}
