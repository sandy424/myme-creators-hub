import { normalizeHttpsLink } from './links.js';

export function saveCareerEntry(career, draft, editingId = null) {
  const values = {
    title: String(draft.title || '').trim(),
    role: String(draft.role || '').trim(),
    contribution: String(draft.contribution || '').trim(),
    link: normalizeHttpsLink(draft.link),
  };
  if (!values.title || !values.role) throw new Error('작품·경력 제목과 담당 역할을 입력해 주세요.');
  if (values.title.length > 150 || values.role.length > 100 || values.contribution.length > 2000) {
    throw new Error('입력 가능한 글자 수를 확인해 주세요.');
  }
  if (editingId !== null) {
    if (!career.some((item) => item.id === editingId)) {
      throw new Error('수정할 경력을 찾을 수 없습니다. 목록을 확인한 후 다시 시도해 주세요.');
    }
    return career.map((item) => (item.id === editingId ? { ...item, ...values } : item));
  }
  return [{ id: crypto.randomUUID(), ...values }, ...career];
}
