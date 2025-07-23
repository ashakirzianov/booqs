'use client'
import { useState } from 'react'
import type { AskTarget, ContextMenuTarget } from './ContextMenuContent'

export function AskTargetMenu({
    target, setTarget
}: {
    target: AskTarget,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const [question, setQuestion] = useState(target.question || '')
    
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
                    // TODO: Implement actual question handling
                    console.log('Question:', question)
                    console.log('BookID:', target.booqId)
                    console.log('Selection:', target.selection)
                    setTarget({ kind: 'empty' })
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