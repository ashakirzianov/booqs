import { useState } from 'react'

export type NavigationSelection = Record<string, boolean>
export function useNavigationState() {
    const [navigationOpen, setNavigationOpen] = useState(false)
    const [navigationSelection, setNavigationSelection] = useState<NavigationSelection>({
        chapters: true,
        notes: true,
    })
    return {
        navigationOpen,
        navigationSelection,
        closeNavigation() {
            setNavigationOpen(false)
        },
        toggleNavigationOpen() {
            setNavigationOpen((prev) => !prev)
        },
        toggleNavigationSelection(item: string) {
            setNavigationSelection(prev => ({
                ...prev,
                [item]: prev[item] !== true,
            }))
        },
    }
}