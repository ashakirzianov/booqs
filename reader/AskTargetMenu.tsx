'use client'
import { useState } from 'react'
import type { AskTarget, ContextMenuTarget } from './ContextMenuContent'
import { useCopilotAnswer, type CopilotContext } from '@/application/copilot'
import type { BooqId, BooqRange } from '@/core/model'

export function AskTargetMenu({
    target, setTarget
}: {
    target: AskTarget,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const [question, setQuestion] = useState(target.question || '')

    // If there's already a question set, show the answer display
    if (target.question !== undefined) {
        return (
            <AnswerDisplay
                booqId={target.booqId}
                question={target.question}
                range={target.selection.range}
                onClose={() => setTarget({ kind: 'empty' })}
            />
        )
    }

    return <div className="p-lg">
        <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this text..."
            className="w-full p-md border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            autoFocus
        />
        <div className="flex gap-md mt-md">
            <button
                onClick={() => {
                    // Set the question in the target to trigger answer display
                    setTarget({
                        ...target,
                        question: question.trim()
                    })
                }}
                className="px-md py-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={!question.trim()}
            >
                Ask
            </button>
            <button
                onClick={() => setTarget({ kind: 'empty' })}
                className="px-md py-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
                Cancel
            </button>
        </div>
    </div>
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
    const context: CopilotContext = {
        booqId,
        start: range.start,
        end: range.end,
    }
    const { loading, answer } = useCopilotAnswer(context, question)

    return (
        <div className="p-lg">
            <div className="mb-md">
                <h3 className="font-semibold text-lg mb-sm">Question:</h3>
                <p className="text-gray-700 italic">&ldquo;{question}&rdquo;</p>
            </div>

            <div className="mb-md">
                <h3 className="font-semibold text-lg mb-sm">Answer:</h3>
                {loading ? (
                    <div className="text-gray-500">Loading answer...</div>
                ) : answer.length > 0 ? (
                    <div className="space-y-sm">
                        {answer.map((line, index) => (
                            <p key={index} className="text-gray-800">{line}</p>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500">No answer available.</div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="px-md py-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    )
}