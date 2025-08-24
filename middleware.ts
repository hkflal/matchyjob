import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n';
 
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});
 
export const config = {
  matcher: [
    '/',
    '/(zh-HK|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};