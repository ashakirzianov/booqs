import { useCallback, useState } from 'react'
import { useOnBooqClick } from '@/viewer'

export function useControlsVisibility() {
    const [visible, setVisible] = useState(false)
    const toggle = useCallback(function () {
        if (!isAnythingSelected()) {
            setVisible(v => !v)
        }
    }, [])
    useOnBooqClick(toggle)
    return {
        visible,
        toggle,
    }
}

function isAnythingSelected() {
    const selection = window.getSelection()
    if (!selection) {
        return false
    }
    return selection.anchorNode !== selection.focusNode
        || selection.anchorOffset !== selection.focusOffset
}