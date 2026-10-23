import { highlight, type Lang } from '@/lib/highlight';

type Props = { code: string; lang: Lang; small?: boolean; label?: string };

export async function CodeBlock({ code, lang, small, label }: Props) {
  const html = await highlight(code, lang);
  return (
    <div
      className={`code-block min-w-0 ${small ? 'code-sm' : ''}`}
      aria-label={label}
      // Shiki output for code authored in this repo, highlighted at build time.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
