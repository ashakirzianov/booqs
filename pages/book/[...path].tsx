import { useRouter } from "next/dist/client/router";
import { Page } from "../../components/Page";
import { useBooq } from "../../app";
import { Spinner } from "../../controls/Spinner";

export default function Book() {
    const router = useRouter();
    const { path } = router.query;
    const booqId = Array.isArray(path)
        ? path.join('/')
        : undefined;
    if (!booqId) {
        return <span>Generating</span>;
    }
    return <BooqPage booqId={booqId} />;
}

function BooqPage({ booqId }: {
    booqId: string,
}) {
    const { loading, booq } = useBooq(booqId);
    return <Page title={booq?.title ?? 'Booq'}>
        {
            loading
                ? <Spinner />
                : <span>{JSON.stringify(booq)}</span>
        }
    </Page>;
}
