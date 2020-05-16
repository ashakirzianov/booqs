import React from 'react';

export type SelectFileResult = {
    file: any,
    fileName: string,
};
export type SelectFileDialogRef = {
    show: () => void,
};
export function SelectFileDialog({
    refCallback, onFilesSelected, accept,
}: {
    accept?: string,
    refCallback: (ref: SelectFileDialogRef) => void,
    onFilesSelected: (data: SelectFileResult) => void,
}) {
    return <input
        accept={accept}
        style={{ display: 'none' }}
        ref={r => refCallback({ show: () => r && r.click() })}
        type='file'
        onChange={e => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                onFilesSelected({
                    file,
                    fileName: file.name,
                });
            }
        }}
    />;
}
