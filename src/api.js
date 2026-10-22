import { mockApi } from './mock/api.js';
export const isMock = import.meta.env.VITE_API_MODE !== 'server';
export async function api(action, body) {
  if (isMock) return mockApi(action, body);
  const response = await fetch('/api/account/' + action, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || '요청을 처리하지 못했습니다.');
  return result;
}
export const emptyState = () => ({
  posts: [],
  members: [],
  projects: [],
  links: [],
  notices: [],
  chats: {},
  career: [],
  pointHistory: [],
});
export const categories = [
  '전체',
  '자유게시판',
  '개발 팁·AI 활용',
  '질문·답변',
  '작품·개발일지',
  '자료 공유',
  '공지·운영 안내',
];
export const languages = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  vi: 'Tiếng Việt',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  es: 'Español',
  fr: 'Français',
  th: 'ไทย',
  id: 'Indonesia',
};
export const publicOptions = {
  photo: '프로필 사진',
  bio: '소개글',
  portfolio: '포트폴리오',
  country: '활동 국가',
  languages: '활동 언어',
  career: '커리어',
};
export function safeUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw Error('HTTPS 주소를 입력해 주세요.');
  return url.href;
}
