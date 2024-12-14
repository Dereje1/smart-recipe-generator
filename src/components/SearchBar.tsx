// SearchBar Component
import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/16/solid';

interface SearchBarProps {
    searchVal: string
    setSearchVal: (val: string) => void
    handleSearch: () => void
}

const SearchBar = ({ searchVal, setSearchVal, handleSearch }: SearchBarProps) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full max-w-screen-lg flex items-center justify-between p-4 mt-4 rounded-full shadow-md bg-green-50 border border-green-300">
            <div className="relative w-full flex items-center">
                {/* Magnifying Glass Icon */}
                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-green-700" />

                {/* Input Field */}
                <input
                    className="w-full pl-10 pr-10 py-2 text-sm text-gray-700 placeholder-gray-600 bg-transparent border-none rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Search recipes by name, ingredient, or type..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={handleKeyPress}
                />

                {/* Clear Button (X Icon) */}
                {searchVal.trim() && (
                    <button
                        className="absolute right-3 text-gray-500 hover:text-green-700 focus:outline-none"
                        onClick={() => setSearchVal('')}
                    >
                        <XMarkIcon className="h-6 w-6 text-green-700" />
                    </button>
                )}
            </div>

            {/* Search Button */}
            <button
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-full focus:ring-4 focus:outline-none focus:ring-green-200 transition-all duration-200"
                onClick={handleSearch}
            >
                Search
            </button>
        </div>
    );
};

export default SearchBar;
