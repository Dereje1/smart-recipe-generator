import React from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function Features({ resetPage }: { resetPage: () => void }) {
  return (
    <div className="animate-fadeInUp mx-auto flex max-w-4xl flex-col items-center gap-10 py-10 md:flex-row md:py-20">
      <div className="flex flex-col items-center text-center md:items-start md:w-1/2 md:text-left space-y-6">
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">Features</h1>
        <p className="text-lg leading-8 text-gray-600">
          Explore what makes Smart Recipe Generator unique.
        </p>
        <ul className="space-y-4 text-gray-500 list-inside dark:text-gray-400 text-left">
          <li className="flex items-start text-lg">
            <CheckCircleIcon className="mr-2 h-6 w-6 text-brand-500" />
            Ingredient-based recipe generation using advanced AI algorithms.
          </li>
          <li className="flex items-start text-lg">
            <CheckCircleIcon className="mr-2 h-6 w-6 text-brand-500" />
            Support for various dietary preferences like vegan, gluten-free, and more.
          </li>
          <li className="flex items-start text-lg">
            <CheckCircleIcon className="mr-2 h-6 w-6 text-brand-500" />
            Easy-to-use interface for adding ingredients and generating recipes.
          </li>
          <li className="flex items-start text-lg">
            <CheckCircleIcon className="mr-2 h-6 w-6 text-brand-500" />
            Save, rate, and share your favorite recipes with others.
          </li>
        </ul>
        <div className="flex gap-4">
          <button
            className="w-fit rounded-md bg-brand-600 px-5 py-3 text-base font-semibold text-white shadow-md transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            onClick={() => signIn('google')}
          >
            Get started
          </button>
          <button
            className="w-fit rounded-md bg-gray-200 px-5 py-3 text-base font-semibold text-gray-900 transition hover:bg-gray-300"
            onClick={resetPage}
          >
            Back to Home
          </button>
        </div>
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