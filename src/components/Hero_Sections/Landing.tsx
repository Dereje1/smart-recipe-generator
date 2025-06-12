import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function Landing() {
    return (
        <div className="animate-fadeInUp mx-auto flex max-w-4xl flex-col items-center gap-10 py-10 md:flex-row md:py-20">
            <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-1/2 space-y-6">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
                    Cook Smarter with AI
                </h1>
                <p className="text-lg leading-8 text-gray-600">
                    Drop in the ingredients you have on hand and let our AI whip up creative recipes tailored to your dietary needs.
                </p>
                <button
                    className="w-fit rounded-md bg-brand-600 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    onClick={() => signIn('google')}
                >
                    Get started
                </button>
            </div>
            <div className="md:w-1/2">
                <Image
                    src="/demo.gif"
                    alt="Smart Recipe Generator demo"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-xl"
                />
            </div>
        </div>
    );
}