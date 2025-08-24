import {redirect} from 'next/navigation';

// Redirect to default locale - next-intl will handle this automatically
// but we need this for the root route
export default function RootPage() {
  redirect('/zh-HK');
}