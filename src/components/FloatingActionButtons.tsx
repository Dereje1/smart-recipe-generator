import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PlusIcon, ArrowUpIcon } from '@heroicons/react/24/solid';

/**
 * FloatingActionButtons Component
 * 
 * This component provides:
 * - A "Create Recipe" button (always visible).
 * - A "Scroll to Top" button (appears after scrolling down).
 */
const FloatingActionButtons = () => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300); // Show scroll button after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-3">
      {/* "Create Recipe" Button (Always Visible) */}
      <button
        onClick={() => router.push('/CreateRecipe')}
        className="bg-brand-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-brand-700 transition-all"
        aria-label="Create Recipe"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Scroll to Top Button (Appears on Scroll) */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="bg-brand-400 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-brand-500 transition-all"
          aria-label="Scroll to Top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default FloatingActionButtons;
