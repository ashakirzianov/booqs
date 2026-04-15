'use client'
import { useState } from 'react'
import type { AskTarget, MenuState } from './ContextMenuContent'
import type { BooqId } from '@/core/model'
import { AskIcon, RemoveIcon } from '@/components/Icons'
import { MenuButton } from './MenuButton'
import { useBooqNotes, QUESTION_KIND } from '@/application/notes'
import { NoteAuthorData } from '@/data/notes'

export function AskTargetMenu({
    target, setMenuState, booqId, user,
}: {
    booqId: BooqId,
    target: AskTarget,
    setMenuState: (target: MenuState) => void,
    user: NoteAuthorData | undefined,
}) {
    const [question, setQuestion] = useState('')
    const { addNote } = useBooqNotes({ booqId, user })

    async function handleAsk() {
        if (!question.trim() || !user) return

        const selection = target.selection
        const result = addNote({
            kind: QUESTION_KIND,
            range: selection.range,
            content: question.trim(),
            privacy: 'public',
            targetQuote: selection.text,
        })

        if (result) {
            const posted = await result.posted
            setMenuState({ kind: 'question-asked', commentId: posted.id })
        }
    }

    return (
        <div className="px-3 py-3 gap-3 flex flex-col bg-background">
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        handleAsk()
                    }
                }}
                placeholder="Ask a question about this quote..."
                className="w-full px-3 py-2 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed focus:outline-none focus:border-action resize-none"
                style={{ fontFamily: 'var(--font-main)', minHeight: '80px' }}
                rows={3}
                autoFocus
            />
            <div className="flex flex-row justify-start gap-4">
                <MenuButton onClick={handleAsk}>
                    <div className="w-4 h-4"><AskIcon /></div>
                    Ask
                </MenuButton>
                <MenuButton onClick={() => setMenuState({ kind: 'empty' })}>
                    <div className="w-4 h-4"><RemoveIcon /></div>
                    Cancel
                </MenuButton>
            </div>
        </div>
    )
}
