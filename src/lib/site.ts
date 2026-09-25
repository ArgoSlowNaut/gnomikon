// Where requests go. Each form on /request opens a pre-filled GitHub issue
// using the templates in .github/ISSUE_TEMPLATE.
export const REPO_URL = 'https://github.com/ArgoSlowNaut/gnomikon';

export function newIssueUrl(template: string, title: string, fields: Record<string, string>): string {
  const params = new URLSearchParams({ template, title });
  for (const [key, value] of Object.entries(fields)) {
    if (value.trim()) params.set(key, value.trim());
  }
  return `${REPO_URL}/issues/new?${params}`;
}
