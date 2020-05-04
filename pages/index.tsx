import Head from 'next/head'
import useSWR from 'swr';
import { fetchGraphQL } from '../lib';

export default function Home(props: any) {
  const { data, error } = useSWR('{ search(query: "eng") {title}}', fetchGraphQL)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {JSON.stringify(data)}
    </div>
  )
}
