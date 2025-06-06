// SearchBar Component
import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/16/solid';
import useWindowSize from './Hooks/useWindowSize';

interface SearchBarProps {
    searchVal: string
    setSearchVal: (val: string) => void
    handleSearch: () => void
    totalRecipes: number
}

const SearchBar = ({ searchVal, setSearchVal, handleSearch, totalRecipes }: SearchBarProps) => {
    const { width } = useWindowSize(); // Get window width
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full max-w-screen-lg flex items-center justify-between p-4 mt-4 rounded-full shadow-md bg-brand-50 border border-brand-300">
            <div className="relative w-full flex items-center">
                {/* Magnifying Glass Icon */}
                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-brand-700" />

                {/* Input Field */}
                <input
                    className="w-full pl-10 pr-10 py-2 text-sm text-gray-700 placeholder-gray-600 bg-transparent border-none rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder={width < 565 ? 'Search recipes...' : 'Search recipes by name, ingredient, or type...'}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={handleKeyPress}
                />

                {/* Clear Button (X Icon) */}
                {searchVal.trim() && (
                    <div className="absolute right-3 flex items-center space-x-1">
                        <button
                            className="text-gray-500 hover:text-brand-700 focus:outline-none"
                            onClick={() => setSearchVal('')}
                        >
                            <XMarkIcon className="h-6 w-6 text-brand-700" />
                        </button>
                        {
                            totalRecipes > 0 && <span className="text-sm text-gray-500 font-bold">{`(${totalRecipes})`}</span>
                        }
                    </div>
                )}
            </div>

            {/* Search Button */}
            <button
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-full focus:ring-4 focus:outline-none focus:ring-brand-200 transition-all duration-200"
                onClick={handleSearch}
            >
                Search
            </button>
        </div>
    );
};

export default SearchBar;
