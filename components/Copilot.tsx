import { BooqSelection, VirtualElement } from '@/viewer'
import { useEffect, useState } from 'react'
import { useFloater } from './Floater'
import { BooqData } from '@/application/booq'

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
            className='container flex flex-col grow items-center font-main select-none transition font-bold p-lg'
        >
            Copilot for fragment:
            {state.kind === 'selected' ?
                state.selection.text : 'Empty selection'}
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