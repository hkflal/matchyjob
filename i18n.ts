import {getRequestConfig} from 'next-intl/server';

export const locales = ['zh-HK', 'en'] as const;
export const defaultLocale = 'zh-HK' as const;

export default getRequestConfig(async ({locale}) => {
  // Ensure we have a valid locale, fallback to default if needed
  const validLocale = locales.includes(locale as typeof locales[number]) 
    ? locale 
    : defaultLocale;
  
  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});