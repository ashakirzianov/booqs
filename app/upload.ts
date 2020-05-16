import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

const UploadEpubMutation = gql`mutation UploadEpub($file: Upload!) {
    uploadEpub(file: $file) {
        id
    }
}`;
type UploadEpubData = {
    uploadEpub: {
        id: string,
    },
};

export function useUploadEpub() {
    const [uploadEpubMutation, { loading }] = useMutation<UploadEpubData>(UploadEpubMutation);
    return {
        uploading: loading,
        uploadEpub(file: any) {
            uploadEpubMutation({ variables: { file } });
        }
    }
}
