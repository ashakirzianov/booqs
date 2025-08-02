import { getCurrentUser } from '@/data/user'
import { notFound } from 'next/navigation'

export default async function NotesPage() {
    const user = await getCurrentUser()
    if (!user) {
        notFound()
    }

    return (
        <main className="flex flex-row justify-center min-h-screen bg-background">
            <div className="flex flex-col max-w-4xl w-full p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-dimmed text-lg">Select a book to read notes</p>
                </div>
            </div>
        </main>
    )
}