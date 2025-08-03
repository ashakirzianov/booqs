import { getCurrentUser } from '@/data/user'
import { fetchBooqsWithOwnNotes } from '@/data/notes'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'My Notes - Booqs',
        description: 'View and manage your book notes and annotations.',
    }
}

export default async function NotesPage() {
    const user = await getCurrentUser()
    if (!user) {
        notFound()
    }

    const booqsWithNotes = await fetchBooqsWithOwnNotes()
    if (booqsWithNotes.length > 0) {
        redirect(`/notes/${booqsWithNotes[0]}`)
    }

    return (
        <main className="flex flex-row justify-center min-h-screen bg-background">
            <div className="flex flex-col max-w-4xl w-full p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-dimmed text-lg">No notes found. Start reading a book to create notes.</p>
                </div>
            </div>
        </main>
    )
}