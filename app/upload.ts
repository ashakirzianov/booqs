import { gql } from "apollo-boost";
import { useMutation, useQuery, useApolloClient } from "@apollo/react-hooks";

type File = any;

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

const UploadStateQuery = gql`query PaletteQuery {
    file @client
    fileName @client
}`;
type UploadStateData = {
    file: File | null,
    fileName: string | null,
};

export const initialUploadStateData: UploadStateData = {
    file: null,
    fileName: null,
};
export function useUpload() {
    const client = useApolloClient();
    const { data: stateData } = useQuery<UploadStateData>(UploadStateQuery);
    const [
        uploadEpub,
        { loading, data: uploadData },
    ] = useMutation<UploadEpubData>(UploadEpubMutation);
    const { file, fileName } = stateData ?? initialUploadStateData;
    return {
        fileName,
        uploading: loading,
        uploaded: uploadData?.uploadEpub?.id,
        setFile(file: File, fileName: string) {
            client.writeData<UploadStateData>({
                data: { file, fileName },
            });
        },
        clear() {
            client.writeData<UploadStateData>({
                data: { file: null, fileName: null },
            });
        },
        doUpload() {
            if (file) {
                uploadEpub({ variables: { file } });
            }
        },
    };
}
