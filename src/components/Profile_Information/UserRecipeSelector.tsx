import { Button } from '@headlessui/react'

interface UserPinsSelectorProps {
    displaySetting: string,
    setDisplaySetting: (arg: string) => void,
}

const unSelected = "py-1.5 px-3 hover:text-blue-600 hover:scale-105 hover:shadow text-center rounded-md h-8 text-sm flex items-center gap-1 lg:gap-2"
const selected = "text-blue-600 bg-gray-100 py-1.5 px-3 hover:text-blue-600 hover:scale-105 hover:shadow text-center rounded-md h-8 text-sm flex items-center gap-1 lg:gap-2"

export default function UserRecipeSelector({ displaySetting, setDisplaySetting }: UserPinsSelectorProps) {
    return (
        <div className="flex rounded-md w-[200px] justify-between mt-3" role="group">
            <Button
                className={displaySetting==='created' ? selected : unSelected}
                onClick={() => setDisplaySetting('created')}
            >
                Created
            </Button>
            <Button
                className={displaySetting==='favorites' ? selected : unSelected}
                onClick={() => setDisplaySetting('favorites')}
            >
                Favorites
            </Button>
        </div>
    );
}