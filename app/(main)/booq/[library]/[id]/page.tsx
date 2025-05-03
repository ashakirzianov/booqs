import { booqCard } from '@/data/booqs'

type Params = {
    library: string,
    id: string,
}
export default async function Page({ params }: {
    params: Promise<Params>,
}) {
    const { library, id } = await params
    const card = await booqCard(`${library}/${id}`)
    return <main>
        <h1>Booq: {JSON.stringify(card)}</h1>
    </main>
}