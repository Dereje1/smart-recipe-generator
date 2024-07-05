import { signIn } from 'next-auth/react';
export default function Landing() {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Generate Delicious Recipes with Your Ingredients
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
                Simply input your available ingredients, select dietary preferences, and let our AI create unique and delicious recipes just for you.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => signIn('google')}
                >
                    Get started
                </button>
            </div>
        </div>
    );
}