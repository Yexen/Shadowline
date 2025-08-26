// Server component (no "use client")
import { redirect } from 'next/navigation';

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const key = typeof searchParams?.key === 'string' ? searchParams!.key : '';
  redirect(`/dev/console/studio${key ? `?key=${encodeURIComponent(key)}` : ''}`);
}
