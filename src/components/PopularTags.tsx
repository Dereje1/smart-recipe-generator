import { useState, useEffect } from "react";
import Image from 'next/image';
import useWindowSize from "./Hooks/useWindowSize";
import tagLoad from '../assets/tagload.gif';

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
    const sliceAmount = width < 640 ? 8 : width < 1024 ? 10 : 20;

    return (
        <div className='w-full py-4'>
            <h2 className='mb-4'>🔥 Popular Tags</h2>
            <div className='flex flex-wrap gap-2'>
                {tags.length === 0 ? (
                        <Image
                            src={tagLoad}
                            alt="tag-load-gif"
                            width={40}
                            height={40}
                        />
                ) : (
                    tags.slice(0, sliceAmount).map(({ _id, count }) => (
                        <button
                            key={_id}
                            className={`px-3 py-1 text-sm font-medium rounded-lg transition ${activeTag === _id
                                ? 'bg-brand-700 text-white'
                                : 'bg-brand-200 text-brand-800 hover:bg-brand-300'
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
