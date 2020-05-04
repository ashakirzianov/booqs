import Head from 'next/head'
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home(props: any) {
  const { data, error } = useSWR('/api/graphql', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {data.data}
    </div>
  )
}
