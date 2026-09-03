const TRANSLITERATIONS: Record<string, string> = {
  ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', đ: 'd', ð: 'd', þ: 'th', ł: 'l', ı: 'i', ħ: 'h', ŧ: 't', ŋ: 'n',
};

/** Lower-case ASCII slug: diacritics stripped, common non-decomposable letters transliterated, the rest dropped. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[øæœßđðþłıħŧŋ]/g, (ch) => TRANSLITERATIONS[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
