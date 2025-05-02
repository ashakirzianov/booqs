import { BooqSelection, VirtualElement } from '@/viewer'
import { useCallback, useEffect, useState } from 'react'
import { useFloater } from './Floater'
import { CopilotContext, useCopilotAnswer, useCopilotSuggestions } from '@/application/copilot'
import { ModalDivider, ModalHeader, ModalFullScreen } from './Modal'
import { useIsSmallScreen } from '@/application/utils'
import { Spinner } from './Icons'

type CopilotEmpty = {
    kind: 'empty',
}
type CopilotSelected = {
    kind: 'selected',
    selection: BooqSelection,
    context: string,
    anchor: VirtualElement,
}
type BooqData = {
    id: string,
    title?: string,
    author?: string,
    language?: string,
    length: number,
}
export type CopilotState = CopilotEmpty | CopilotSelected
type CopilotProps = {
    state: CopilotState,
    setState: (state: CopilotState) => void,
    booq: BooqData,
}
export function Copilot(props: CopilotProps) {
    const small = useIsSmallScreen()
    if (!small) {
        return <CopilotFloating {...props} />
    } else {
        return <CopilotModal {...props} />
    }
}

function CopilotFloating({ state, setState, booq }: CopilotProps) {
    const { FloaterNode, setReference } = useFloater({
        isOpen: state.kind !== 'empty',
        setIsOpen: open => {
            if (!open) {
                setState({ kind: 'empty' })
            }
        },
        Content: <div
            className='container flex flex-col grow items-center font-main select-none transition font-bold max-w-[var(--content-width)]'
        >
            <CopilotStateContent state={state} booq={booq} />
        </div>,
    })
    useEffect(() => {
        if (state.kind === 'selected') {
            setReference(state.anchor)
        }
    }, [state, setReference])
    return FloaterNode
}

function CopilotModal({ state, setState, booq }: CopilotProps) {
    const isOpen = state.kind !== 'empty'
    const closeModal = useCallback(() => {
        setState({ kind: 'empty' })
    }, [setState])
    return <ModalFullScreen isOpen={isOpen}>
        <ModalHeader text='Ask Copilot' onClose={closeModal} />
        <ModalDivider />
        <div className='flex flex-col grow items-center justify-start font-main select-none transition font-bold overflow-y-auto'>
            <CopilotStateContent state={state} booq={booq} />
        </div>
    </ModalFullScreen>
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
    const context = {
        text: state.selection.text,
        context: state.context,
        booqId: booq.id,
        title: booq.title ?? 'Unknown',
        author: booq.author ?? 'Unknown author',
        language: booq.language ?? 'en-US',
        start: state.selection.range.start,
        end: state.selection.range.end,
    }
    const { loading, suggestions } = useCopilotSuggestions(context)
    const [question, askQuestion] = useState(undefined as string | undefined)
    if (question) {
        return <CopilotQuestion context={context} question={question} />
    }
    return loading
        ? <div className='p-lg'><Spinner /></div>
        : <div className='flex flex-col font-menu text-primary text-lg font-bold'>
            {suggestions.map(
                (s, i) => <>
                    <div key={i} className='flex cursor-pointer decoration-dotted text-dimmed hover:underline hover:text-highlight p-lg' onClick={() => askQuestion(s)}>
                        {`${i + 1}. ${s}`}<br />
                    </div>
                    <ModalDivider />
                </>)
            }
        </div>
}

function CopilotQuestion({ context, question }: {
    context: CopilotContext,
    question: string,
}) {
    const { loading, answer } = useCopilotAnswer(context, question)
    return loading
        ? <div className='p-lg'><Spinner /></div>
        : <div className='flex font-menu p-lg'>
            {answer}
        </div>
}