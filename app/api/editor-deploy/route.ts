import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"

interface DeployNodePayload {
  id: string
  type: string
  label: string
  isGrouped: boolean
  geometry: { x: number; y: number; width: number; height: number }
  style: Record<string, unknown>
  content: Record<string, unknown>
  explicitContent: boolean
  explicitStyle: boolean
  explicitPosition: boolean
  explicitSize: boolean
}

interface DeployRequestPayload {
  level: "green" | "yellow" | "red"
  findings: Array<{ element: string; issue: string; severity: "green" | "yellow" | "red"; blocks: boolean }>
  nodes: DeployNodePayload[]
}

interface GithubRefResponse {
  object?: { sha?: string }
}

interface DeployStepResult {
  step: "checking" | "saving" | "creating_branch" | "committing" | "creating_pr"
  ok: boolean
  message: string
}

async function githubRequest<T>(url: string, init: RequestInit, token: string): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "t4t-editor-deploy",
      ...(init.headers || {}),
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub API error ${response.status}: ${text}`)
  }
  return response.json() as Promise<T>
}

async function runGithubFlow(content: string): Promise<{
  prUrl: string | null
  steps: DeployStepResult[]
  error?: string
}> {
  const steps: DeployStepResult[] = []
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const baseBranch = process.env.GITHUB_BASE_BRANCH || "main"

  if (!token) {
    steps.push({ step: "creating_branch", ok: false, message: "GITHUB_TOKEN missing." })
    return {
      prUrl: null,
      steps,
      error: "Deploy incomplete: changes were saved locally, but PR could not be created because GITHUB_TOKEN is missing.",
    }
  }
  if (!repo) {
    steps.push({ step: "creating_branch", ok: false, message: "GITHUB_REPO missing." })
    return {
      prUrl: null,
      steps,
      error: "Deploy incomplete: changes were saved locally, but PR could not be created because GITHUB_REPO is missing.",
    }
  }

  const [owner, repoName] = repo.split("/")
  if (!owner || !repoName) {
    steps.push({ step: "creating_branch", ok: false, message: "GITHUB_REPO must be owner/repo." })
    return {
      prUrl: null,
      steps,
      error: "Deploy incomplete: GITHUB_REPO must use owner/repo format.",
    }
  }

  let branchName = ""

  try {
    const refData = await githubRequest<GithubRefResponse>(
      `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${baseBranch}`,
      { method: "GET" },
      token
    )
    const baseSha = refData.object?.sha
    if (!baseSha) throw new Error("Could not resolve base branch SHA")

    branchName = `editor-deploy-${Date.now()}`
    await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      },
      token
    )
    steps.push({ step: "creating_branch", ok: true, message: `Branch created: ${branchName}` })
  } catch (error) {
    steps.push({ step: "creating_branch", ok: false, message: error instanceof Error ? error.message : "Unknown branch creation error." })
    return {
      prUrl: null,
      steps,
      error: `Failed at create_branch: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  try {
    await githubRequest(
      `https://api.github.com/repos/${owner}/${repoName}/contents/public/data/editor-deploy-state.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "chore(editor): persist visual editor deploy state",
          content: Buffer.from(content, "utf8").toString("base64"),
          branch: branchName,
        }),
      },
      token
    )
    steps.push({ step: "committing", ok: true, message: "Commit created in branch." })
  } catch (error) {
    steps.push({ step: "committing", ok: false, message: error instanceof Error ? error.message : "Unknown commit error." })
    return {
      prUrl: null,
      steps,
      error: `Failed at committing: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  try {
    const pr = await githubRequest<{ html_url?: string }>(
      `https://api.github.com/repos/${owner}/${repoName}/pulls`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Editor deploy: persist visual changes",
          head: branchName,
          base: baseBranch,
          body: "Automated editor deploy payload. GitHub Actions checks will run on this PR.",
        }),
      },
      token
    )
    const prUrl = pr.html_url || null
    if (!prUrl) {
      steps.push({ step: "creating_pr", ok: false, message: "PR API returned without html_url." })
      return { prUrl: null, steps, error: "Failed at create_pr: GitHub did not return PR URL." }
    }
    steps.push({ step: "creating_pr", ok: true, message: `PR created: ${prUrl}` })
    return { prUrl, steps }
  } catch (error) {
    steps.push({ step: "creating_pr", ok: false, message: error instanceof Error ? error.message : "Unknown PR error." })
    return {
      prUrl: null,
      steps,
      error: `Failed at create_pr: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function POST(request: Request) {
  try {
    const steps: DeployStepResult[] = [{ step: "checking", ok: true, message: "Payload received." }]
    const payload = (await request.json()) as DeployRequestPayload

    if (!payload || !Array.isArray(payload.nodes) || !Array.isArray(payload.findings) || !payload.level) {
      return NextResponse.json({ message: "Invalid deploy payload." }, { status: 400 })
    }
    if (payload.nodes.length === 0) {
      return NextResponse.json({ message: "Invalid deploy payload: nodes array is empty." }, { status: 400 })
    }
    if (payload.level === "red") {
      return NextResponse.json({ message: "Deploy blocked by red pre-check findings." }, { status: 400 })
    }

    const persistable = {
      createdAt: new Date().toISOString(),
      source: "visual-editor",
      level: payload.level,
      findings: payload.findings,
      nodes: payload.nodes,
    }
    const serialized = JSON.stringify(persistable, null, 2)

    const outputDir = path.join(process.cwd(), "public", "data")
    await mkdir(outputDir, { recursive: true })
    const outputPath = path.join(outputDir, "editor-deploy-state.json")
    await writeFile(outputPath, serialized, "utf8")
    steps.push({ step: "saving", ok: true, message: "State persisted locally to public/data/editor-deploy-state.json." })

    const githubResult = await runGithubFlow(serialized)
    const mergedSteps = steps.concat(githubResult.steps)

    if (githubResult.prUrl) {
      return NextResponse.json({
        status: "ok",
        mode: "complete",
        step: "done",
        localSaved: true,
        remoteReady: true,
        message: "Branch created, commit pushed, and PR opened successfully.",
        prUrl: githubResult.prUrl,
        steps: mergedSteps,
      })
    }

    const failedStep = mergedSteps.find((s) => !s.ok)?.step || "creating_pr"
    return NextResponse.json({
      status: "incomplete",
      mode: "incomplete",
      step: failedStep,
      localSaved: true,
      remoteReady: false,
      message:
        githubResult.error ||
        "Deploy incomplete: changes were saved locally, but branch/commit/PR could not be completed.",
      steps: mergedSteps,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Editor deploy route failed." },
      { status: 500 }
    )
  }
}
