import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ErrorPage({ message }: { message?: string }) {
    const router = useRouter();
    const { error } = router.query;

    let errorMessage = `An unexpected error: "${error}" occurred. Please try again later.`;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-4">{message || 'Sign In Error'}</h1>
            <p className="text-red-500 mb-4">{message ? '' : errorMessage}</p>
            <Link href="/" className="mt-4 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600">
                Go to Home
            </Link>
        </div>
    );
}
