import { useState } from 'react'
import Header from "./Header"
import RecipeCreation from "./Recipe_Creation/Navigation"

interface DashboardProps {
    user: {
        name?: string | null | undefined
        image?: string | null | undefined
        email?: string | null | undefined
    } | undefined
}

function Display({ selection }: { selection: string }) {
    switch (selection) {
        case "Create Recipes":
            return <RecipeCreation />
        default:
            return (
                <div className="min-h-full">
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{selection}</h1>
                        </div>
                    </header>
                    <main>
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{/* Your content */}</div>
                    </main>
                </div>
            );
    }
}

export default function Dashboard({ user }: DashboardProps) {
    const [selectedNav, setSelectedNav] = useState('')
    return (
        <>
            <Header user={user} updateSelection={(selected: string) => setSelectedNav(selected)} />
            <Display selection={selectedNav} />
        </>
    )
}
