import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { XMarkIcon } from '@heroicons/react/24/solid';

const ProfileStickyBanner = ({ userHasRecipes }: { userHasRecipes: boolean }) => {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();
  
    useEffect(() => {
      // Show banner if the user has no recipes & hasn't dismissed it
      if (!userHasRecipes && !localStorage.getItem('dismissedRecipeBanner')) {
        setIsVisible(true);
      }
    }, [userHasRecipes]);
  
    const dismissBanner = () => {
      setIsVisible(false);
      localStorage.setItem('dismissedRecipeBanner', 'true'); // Remember user dismissed it
    };
  
    if (!isVisible) return null; // Don't render if dismissed
  
    return (
      <div className="sticky top-16 mt-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md flex items-center justify-between">
        <div>
          <p className="font-semibold text-lg">👩‍🍳 Ready to Cook?</p>
          <p>Create your first recipe now and share your culinary ideas!</p>
          <button
            className="mt-2 bg-brand-500 text-white px-3 py-2 rounded-md hover:bg-brand-600 transition"
            onClick={() => router.push('/CreateRecipe')}
          >
            🍽️ Create a Recipe
          </button>
        </div>
        <button onClick={dismissBanner} className="ml-4 text-yellow-600 hover:text-yellow-800" aria-label='close'>
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    );
  };
  

export default ProfileStickyBanner;
