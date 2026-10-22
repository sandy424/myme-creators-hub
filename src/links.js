export function normalizeHttpsLink(value = '') {
  const link = String(value).trim();
  if (!link) return '';
  if (link.length > 2000) throw new Error('관련 링크는 2,000자 이내로 입력해 주세요.');
  try {
    const url = new URL(link);
    if (url.protocol === 'https:') return url.href;
  } catch {
    // Use the same readable error for malformed and non-HTTPS URLs.
  }
  throw new Error('관련 링크는 https://로 시작하는 올바른 주소를 입력해 주세요.');
}
