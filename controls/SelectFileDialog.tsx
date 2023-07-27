import { useState, useRef } from 'react'

export function useSelectFileDialog({ accept }: {
    accept?: string,
}) {
    const [file, setFile] = useState<File | undefined>(undefined)
    const ref = useRef<HTMLInputElement>()
    return {
        openDialog: () => ref.current?.click(),
        dialogContent: <input
            accept={accept}
            style={{ display: 'none' }}
            ref={r => ref.current = r ?? undefined}
            type='file'
            onChange={e => {
                const file = e.target.files && e.target.files[0]
                setFile(file ?? undefined)
            }}
        />,
        file,
        clearFile: () => setFile(undefined),
    }
}
