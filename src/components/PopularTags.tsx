import { useState, useEffect } from "react";
import useWindowSize from "./Hooks/useWindowSize";

interface Tag {
    _id: string;
    count: number;
}

interface PopularTagsProps {
    tags: Tag[];
    onTagToggle: (activeTag: string) => void;
    searchVal: string;
}

const PopularTags = ({ tags, onTagToggle, searchVal }: PopularTagsProps) => {
    const [activeTag, setActiveTag] = useState<string>('');

    const { width } = useWindowSize();

    useEffect(() => {
        if (!searchVal.trim()) {
            setActiveTag('');
        }
    }, [searchVal]);

    const handleTagClick = (tag: string) => {
        const newActiveTag = activeTag === tag ? '' : tag;
        setActiveTag(newActiveTag);
        onTagToggle(newActiveTag);
    };

    // Adjust tag display count based on screen size
    const sliceAmount = width < 640 ? 7 : width < 1024 ? 10 : 20;

    return (
        <div className='w-full py-4'>
            <h2 className='text-lg font-semibold text-gray-800 mb-2'>🔥 Popular Tags</h2>
            <div className='flex flex-wrap gap-2'>
                {tags.length === 0 ? (
                    <p className='text-gray-500'>No popular tags available.</p>
                ) : (
                    tags.slice(0, sliceAmount).map(({ _id, count }) => (
                        <button
                            key={_id}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition ${
                                activeTag === _id
                                    ? 'bg-green-700 text-white'
                                    : 'bg-green-200 text-green-800 hover:bg-green-300'
                            }`}
                            onClick={() => handleTagClick(_id)}
                        >
                            {_id} ({count})
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default PopularTags;
