'use client'
import { useState } from 'react'
import type { AskTarget, ContextMenuTarget } from './ContextMenuContent'
import { useCopilotAnswerStream } from '@/application/copilot'
import type { BooqId, BooqRange } from '@/core/model'
import { MenuButton } from '@/components/Buttons'
import { CopilotIcon, CloseIcon, RemoveIcon } from '@/components/Icons'

export function AskTargetMenu({
    target, setTarget, booqId
}: {
    booqId: BooqId,
    target: AskTarget,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const [question, setQuestion] = useState(target.question || '')

    function handleAsk() {
        if (question.trim()) {
            setTarget({
                ...target,
                question: question.trim()
            })
        }
    }

    // If there's already a question set, show the answer display
    if (target.question !== undefined) {
        return (
            <AnswerDisplay
                booqId={booqId}
                question={target.question}
                range={target.selection.range}
                onClose={() => setTarget({ kind: 'empty' })}
            />
        )
    }

    return (
        <div className="px-3 py-3 gap-3 flex flex-col bg-background">
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAsk()
                    }
                }}
                placeholder="Ask a question about this text..."
                className="w-full px-3 py-2 border border-dimmed rounded bg-background text-primary text-sm leading-relaxed focus:outline-none focus:border-action"
                style={{ fontFamily: 'var(--font-main)' }}
                autoFocus
            />
            <div className="flex flex-row justify-start gap-4">
                <MenuButton
                    onClick={handleAsk}
                >
                    <div className="w-4 h-4"><CopilotIcon /></div>
                    Ask
                </MenuButton>
                <MenuButton
                    onClick={() => setTarget({ kind: 'empty' })}
                >
                    <div className="w-4 h-4"><RemoveIcon /></div>
                    Cancel
                </MenuButton>
            </div>
        </div>
    )
}

function AnswerDisplay({
    booqId,
    question,
    range,
    onClose
}: {
    booqId: BooqId,
    question: string,
    range: BooqRange,
    onClose: () => void
}) {
    const { loading, answer, error } = useCopilotAnswerStream({
        booqId,
        start: range.start,
        end: range.end,
        question,
    })

    return (
        <div className="px-3 py-3 gap-3 flex flex-col bg-background">
            <div className="mb-3">
                <div className="text-sm font-medium text-primary mb-2">Question:</div>
                <div className="text-sm text-dimmed italic">&ldquo;{question}&rdquo;</div>
            </div>

            <div className="mb-3">
                <div className="text-sm font-medium text-primary mb-2">Answer:</div>
                <div className="text-sm text-primary leading-relaxed" style={{ fontFamily: 'var(--font-main)' }}>
                    {loading ? (
                        <div className="text-dimmed">
                            {answer ? (
                                <div className="space-y-2">
                                    <div>{answer}</div>
                                    <div className="text-xs text-dimmed animate-pulse">...</div>
                                </div>
                            ) : (
                                <div>Loading answer...</div>
                            )}
                        </div>
                    ) : error ? (
                        <div className="text-alert">Error: {error}</div>
                    ) : answer ? (
                        <div className="space-y-2">
                            {answer}
                        </div>
                    ) : (
                        <div className="text-dimmed">No answer available.</div>
                    )}
                </div>
            </div>

            <div className="flex flex-row justify-start">
                <MenuButton onClick={onClose}>
                    <div className="w-4 h-4"><CloseIcon /></div>
                    Close
                </MenuButton>
            </div>
        </div>
    )
}