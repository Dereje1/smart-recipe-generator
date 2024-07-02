import { useState } from 'react'
import withAuth from './withAuth'

function Home() {
    const [selectedNav, setSelectedNav] = useState('')
    return (
        <div className="min-h-full">
        <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recipe List</h1>
            </div>
        </header>
        <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{/* Your content */}</div>
        </main>
    </div>
    )
}

export default withAuth(Home);