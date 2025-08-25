// src/app/dev/console/page.tsx  (server component – no "use client")
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dev/console/studio');
}
