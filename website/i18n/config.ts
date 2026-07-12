export const locales = ['zh', 'zh-cn', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

/** 默认语言:网站以简体中文为主。「/」会以浏览器语言使用对应语言。 */
export const defaultLocale: Locale = 'zh-cn';

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

/** <html lang> 用的 BCP-47 标记。 */
export const htmlLang: Record<Locale, string> = { 'zh-cn': 'zh-CN', zh: 'zh-Hant', en: 'en', ja: 'ja' };

/** Open Graph 的 locale。 */
export const ogLocale: Record<Locale, string> = { 'zh-cn': 'zh_CN', zh: 'zh_TW', en: 'en_US', ja: 'ja_JP' };

/** 语言切换器显示的名称。 */
export const localeName: Record<Locale, string> = { 'zh-cn': '简体中文', zh: '繁體中文', en: 'English', ja: '日本語' };

/** hreflang alternates:格语言网址 + x-default。 */
export const alternateLanguages: Record<string, string> = {
  'zh-Hans': '/zh-cn/',
  'zh-Hant': '/zh/',
  en: '/en/',
  ja: '/ja/',
  'x-default': '/zh-cn/',
};