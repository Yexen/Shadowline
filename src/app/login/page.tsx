'use client'
import { redirect } from 'next/navigation'

export default function LoginPage() {
    // Redirect to the main auth page.
    redirect('/auth');
    return null;
}
