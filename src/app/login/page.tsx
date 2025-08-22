
'use client'
import { redirect } from 'next/navigation'

export default function LoginPage() {
    // Redirect to the main auth page which now contains the login form.
    redirect('/auth');
    return null;
}
