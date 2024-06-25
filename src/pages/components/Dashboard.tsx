import { useState } from 'react'
import Header from "./Header"

interface DashboardProps {
    user: {
        name?: string | null | undefined
        image?: string | null | undefined
        email?: string | null | undefined
    } | undefined
}


export default function Dashboard({ user }: DashboardProps) {
    const [selectedNav, setSelectedNav] = useState('')
    return (
        <>
            <Header user={user} updateSelection={(selected: string) => setSelectedNav(selected)} />
            <div className="min-h-full">


                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{selectedNav}</h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{/* Your content */}</div>
                </main>
            </div>
        </>
    )
}
