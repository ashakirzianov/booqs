import { BooqSelection, VirtualElement } from '@/viewer'
import { useEffect, useState } from 'react'
import { useFloater } from './Floater'
import { BooqData } from '@/application/booq'
import { CopilotContext, useCopilotAnswer, useCopilotSuggestions } from '@/application/copilot'
import { Spinner } from './Loading'

type CopilotEmpty = {
    kind: 'empty',
}
type CopilotSelected = {
    kind: 'selected',
    selection: BooqSelection,
    context: string,
    anchor: VirtualElement,
}
export type CopilotState = CopilotEmpty | CopilotSelected

export function useCopilot(booq: BooqData) {
    let [state, setState] = useState<CopilotState>({
        kind: 'empty',
    })
    let { FloaterNode, setReference } = useFloater({
        isOpen: state.kind !== 'empty',
        setIsOpen: open => {
            if (!open) {
                setState({ kind: 'empty' })
            }
        },
        Content: <div
            className='container flex flex-col grow items-center font-main select-none transition font-bold p-lg w-prose'
        >
            <CopilotStateContent state={state} booq={booq} />
        </div>,
    })
    useEffect(() => {
        if (state.kind === 'selected') {
            setReference(state.anchor)
        }
    }, [state, setReference])
    return {
        state,
        setState,
        CopilotNode: FloaterNode,
    }
}

function CopilotStateContent({ state, booq }: {
    state: CopilotState,
    booq: BooqData,
}) {
    switch (state.kind) {
        case 'empty':
            return <CopilotEmptyContent state={state} />
        case 'selected':
            return <CopilotSelectedContent state={state} booq={booq} />
    }
}

function CopilotEmptyContent({ }: {
    state: CopilotEmpty,
}) {
    return 'Empty'
}

function CopilotSelectedContent({ state, booq }: {
    state: CopilotSelected,
    booq: BooqData,
}) {
    let context = {
        text: state.selection.text,
        context: state.context,
        booqId: booq.id,
        title: booq.title ?? 'Unknown',
        author: booq.author ?? 'Unknown author',
        language: booq.language ?? 'en-US',
        start: state.selection.range.start,
        end: state.selection.range.end,
    }
    let { loading, suggestions } = useCopilotSuggestions(context)
    let [question, askQuestion] = useState(undefined as string | undefined)
    if (question) {
        return <CopilotQuestion context={context} question={question} />
    }
    return loading
        ? <Spinner />
        : <div className='flex flex-col font-menu text-blue-400 font-bold'>
            {suggestions.map(
                (s, i) => <div key={i} className='flex cursor-pointer hover:underline decoration-dotted' onClick={() => askQuestion(s)}>
                    {`${i}. ${s}`}<br />
                </div>)
            }
        </div>
}

function CopilotQuestion({ context, question }: {
    context: CopilotContext,
    question: string,
}) {
    let { loading, answer } = useCopilotAnswer(context, question)
    return loading
        ? <Spinner />
        : <div className='font-menu'>
            {answer}
        </div>
}