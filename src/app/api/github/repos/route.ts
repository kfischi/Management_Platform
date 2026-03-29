import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type GitHubRepo = {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  updated_at: string;
  default_branch: string;
  language: string | null;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const token = process.env.GITHUB_TOKEN;
  if (!token || token.startsWith("ghp_your")) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN לא מוגדר – הוסף אותו ל-.env.local" },
      { status: 503 }
    );
  }

  // Fetch up to 100 repos per page (personal + orgs)
  const pages = await Promise.all([
    fetchRepos(token, "user/repos", 1),
    fetchRepos(token, "user/repos", 2),
  ]);
  const repos: GitHubRepo[] = pages.flat();

  return NextResponse.json(repos);
}

async function fetchRepos(token: string, path: string, page: number): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/${path}?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `GitHub API error ${res.status}`);
  }

  return res.json();
}
