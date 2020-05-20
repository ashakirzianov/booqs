import { useRouter } from "next/dist/client/router";

export default function Book() {
    const router = useRouter();
    const { path } = router.query;
    const id = Array.isArray(path)
        ? path.join('/')
        : undefined;
    return <div>
        {id}
    </div>;
}
