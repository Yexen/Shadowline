
// src/app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

import { redirect } from 'next/navigation';

export default function RootRedirect() {
  redirect('/home');
}

