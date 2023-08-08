import { BooqSelection, VirtualElement } from '@/viewer'
import { useEffect, useState } from 'react'
import { useFloater } from './Floater'
import { BooqData } from '@/application/booq'
import { useCopilotSuggestions } from '@/application/copilot'
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
            className='container flex flex-col grow items-center font-main select-none transition font-bold p-lg w-60'
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
    let { loading, suggestions } = useCopilotSuggestions({
        text: state.selection.text,
        context: state.context,
        booqId: booq.id,
        title: booq.title ?? 'Unknown',
        // TODO: fetch author and language from booq
        author: 'Unknown author', // booq.author ?? 'Unknown author',
        language: 'en', // booq.language,
        start: state.selection.range.start,
        end: state.selection.range.end,
    })
    console.log(loading, suggestions)
    return loading
        ? <Spinner />
        : <div className='font-menu text-blue-400 font-bold'>
            {suggestions.map(
                (s, i) => <div key={i} className='cursor-pointer hover:underline decoration-dotted'>
                    {`${i + 1}. ${s}`}
                </div>)
            }
        </div>
}