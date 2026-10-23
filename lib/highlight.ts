import { codeToHtml } from 'shiki';

export type Lang = 'html' | 'tsx' | 'ts' | 'js' | 'python' | 'php' | 'json' | 'http' | 'bash';

/** Build-time highlighting of repo-authored code only; output goes to dangerouslySetInnerHTML. */
export function highlight(code: string, lang: Lang): Promise<string> {
  return codeToHtml(code.trimEnd(), { lang, theme: 'github-dark-default' });
}
