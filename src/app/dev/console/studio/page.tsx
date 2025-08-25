// NOTE: no "use client" here — this is a server file.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

import DevStudioClient from './DevStudioClient';

export default function Page() {
  return <DevStudioClient />;
}

