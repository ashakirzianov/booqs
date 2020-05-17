import gql from 'graphql-tag';
import { useMutation } from "@apollo/react-hooks";

export type FileData = any;

const UploadEpubMutation = gql`mutation UploadEpub($file: Upload!) {
    uploadEpub(file: $file) {
        id
        title
    }
}`;
type UploadEpubData = {
    uploadEpub: {
        id: string,
        title?: string,
    },
};

export type UploadState = ReturnType<typeof useUpload>;
export function useUpload() {
    const [
        uploadEpub,
        { loading, data: uploadData },
    ] = useMutation<UploadEpubData>(UploadEpubMutation);
    return {
        uploading: loading,
        uploaded: uploadData?.uploadEpub,
        upload(file: FileData) {
            uploadEpub({ variables: { file } });
        },
    };
}
