import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { currentSource } from './common'

export type FileData = any;

const UploadEpubMutation = gql`mutation UploadEpub($file: Upload!, $source: String!) {
    uploadEpub(file: $file, source: $source) {
        id
        title
        cover
    }
}`
type UploadEpubData = {
    uploadEpub: {
        id: string,
        title?: string,
        cover?: string,
    },
};
type UploadEpubVariables = {
    file: FileData,
    source: string,
};

export type UploadState = ReturnType<typeof useUpload>;
export function useUpload() {
    const [
        uploadEpub,
        { loading, data: uploadData },
    ] = useMutation<UploadEpubData, UploadEpubVariables>(
        UploadEpubMutation,
    )
    return {
        uploading: loading,
        uploaded: uploadData?.uploadEpub,
        upload(file: FileData) {
            uploadEpub({
                variables: { file, source: currentSource() },
            })
        },
    }
}
