import { ReactNode } from 'react'

export const panelWidth = '40rem'

export function Panel({ children }: {
    children: ReactNode,
}) {
    return <div className="panel rounded m-xl flex flex-row grow-0 shrink w-full max-w-2xl overflow-hidden">
        {children}
    </div>
}
