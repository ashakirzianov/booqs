import { useState, useRef } from 'react';

export function useSelectFileDialog({ accept }: {
    accept?: string,
}) {
    const [file, setFile] = useState<File | null>(null);
    const ref = useRef<HTMLInputElement>();
    return {
        dialogContent: <input
            accept={accept}
            style={{ display: 'none' }}
            ref={r => ref.current = r ?? undefined}
            type='file'
            onChange={e => {
                const file = e.target.files && e.target.files[0];
                setFile(file);
            }}
        />,
        openDialog: () => ref.current?.click(),
        file,
    };
}
