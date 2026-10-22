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

const aliases = {
  ko: ['한국어', '한국말', 'korean'],
  en: ['영어', 'english'],
  ja: ['일본어', '日本語', 'japanese'],
  vi: ['베트남어', 'tiếng việt', 'vietnamese'],
  'zh-CN': ['중국어', '简体中文', 'chinese'],
  'zh-TW': ['중국어 번체', '繁體中文', 'traditional chinese'],
  es: ['스페인어', 'español', 'spanish'],
  fr: ['프랑스어', 'français', 'french'],
  th: ['태국어', 'ไทย', 'thai'],
  id: ['인도네시아어', 'indonesia', 'indonesian'],
};

export function getChatLanguage(profile = {}) {
  if (Object.hasOwn(languages, profile.chatLanguage)) return profile.chatLanguage;
  const first = String(profile.languages || '')
    .split(/[,;/|·\n]/)[0]
    .trim()
    .toLowerCase();
  const code = Object.keys(languages).find((language) => language.toLowerCase() === first);
  if (code) return code;
  return Object.keys(aliases).find((language) => aliases[language].includes(first)) || 'ko';
}
