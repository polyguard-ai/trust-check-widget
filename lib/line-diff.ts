export type DiffKind = 'same' | 'del' | 'add';
export type DiffCell = { text: string; kind: DiffKind } | null;
export type DiffLine = { left: DiffCell; right: DiffCell };

/** Line-level LCS diff, paired for side-by-side display. */
export function sideBySide(before: string, after: string): DiffLine[] {
  const a = before.trimEnd().split('\n');
  const b = after.trimEnd().split('\n');
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let dels: string[] = [];
  let adds: string[] = [];
  const flush = () => {
    for (let k = 0; k < Math.max(dels.length, adds.length); k++) {
      out.push({
        left: k < dels.length ? { text: dels[k], kind: 'del' } : null,
        right: k < adds.length ? { text: adds[k], kind: 'add' } : null,
      });
    }
    dels = [];
    adds = [];
  };

  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      flush();
      out.push({ left: { text: a[i], kind: 'same' }, right: { text: b[j], kind: 'same' } });
      i++;
      j++;
    } else if (j < b.length && (i >= a.length || lcs[i][j + 1] >= lcs[i + 1][j])) {
      adds.push(b[j++]);
    } else {
      dels.push(a[i++]);
    }
  }
  flush();
  return out;
}
