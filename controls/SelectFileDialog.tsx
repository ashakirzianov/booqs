import React from 'react';

export type SelectFileDialogRef = {
    show(): void,
};
export function SelectFileDialog({
    refCallback, accept, onFileChanged,
}: {
    accept?: string,
    refCallback: (ref: SelectFileDialogRef) => void,
    onFileChanged: (file: File) => void,
}) {
    return <input
        accept={accept}
        style={{ display: 'none' }}
        ref={r => refCallback({
            show() {
                r?.click();
            }
        })}
        type='file'
        onChange={e => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                onFileChanged(file);
            }
        }}
    />;
}
