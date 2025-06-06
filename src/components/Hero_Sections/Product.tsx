
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function Product({ resetPage }: { resetPage: () => void }) {
  return (
    <div className="flex flex-col justify-center items-center px-4 md:px-8 lg:px-12 animate-fadeInUp">
      <h1 className="mb-2 text-4xl font-semibold text-gray-900 dark:text-white text-center">Our Product</h1>
      <h2 className="mt-6 mb-5 text-2xl leading-8 text-gray-600 text-center max-w-2xl">
        Learn more about the amazing features of our product.
      </h2>
      <ul className="space-y-4 text-gray-500 list-inside dark:text-gray-400">
        <li className="flex items-center text-lg">
          <CheckCircleIcon className="block mr-2 h-6 w-6 text-brand-500" />
          AI-powered recipe generation using your available ingredients.
        </li>
        <li className="flex items-center text-lg">
          <CheckCircleIcon className="block mr-2 h-6 w-6 text-brand-500" />
          Customized recipes based on dietary preferences and restrictions.
        </li>
        <li className="flex items-center text-lg">
          <CheckCircleIcon className="block mr-2 h-6 w-6 text-brand-500" />
          User-friendly interface to easily add ingredients and generate recipes.
        </li>
        <li className="flex items-center text-lg">
          <CheckCircleIcon className="block mr-2 h-6 w-6 text-brand-500" />
          Option to save, rate, and share your favorite recipes.
        </li>
      </ul>
      <button
        className="mt-10 rounded-md bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        onClick={resetPage}
      >
        Back to Home
      </button>
    </div>
  );
}
