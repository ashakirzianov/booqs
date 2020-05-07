import { Page } from "../atoms/Page";
import { AppBar } from "../atoms/AppBar";
import { BooqCardProps } from "../atoms/BooqCard";
import { Featured } from "../atoms/Featured";

export async function getStaticProps() {
  return {
    props: {
      cards,
    },
  };
}

export default function Home({ cards }: {
  cards: BooqCardProps[],
}) {
  return <Page title="Booqs">
    <AppBar />
    <Featured cards={cards} />
    <style jsx>{`
      div {
        display: flex;
        flex-direction: column;
        border: 1px solid blue;
      }
      `}</style>
  </Page>;
}

const cards: BooqCardProps[] = [
  {
    title: 'Republic',
    author: 'Plato',
    cover: 'https://booka-lib-images.s3.amazonaws.com/@cover@large@pg55201',
    tags: [
      { tag: 'pages', value: '312' },
      { tag: 'language', value: 'en' },
      { tag: 'subject', value: 'Philosophy' },
      { tag: 'subject', value: 'Classic' },
      { tag: 'pg-index', value: '5319' },
    ],
  },
  {
    title: 'Nausea',
    author: 'Sartre',
    cover: 'https://booqs-uploads-images.s3.amazonaws.com/@cover@large@nausea',
    tags: [
      { tag: 'pages', value: '102' },
      { tag: 'language', value: 'fr' },
      { tag: 'subject', value: 'Fiction' },
      { tag: 'subject', value: 'Philosophy' },
      { tag: 'subject', value: 'Classic' },
    ],
  },
  {
    title: 'Rayuela',
    author: 'Cortázar',
    cover: 'https://booqs-uploads-images.s3.amazonaws.com/@cover@large@igra-v-klassiki',
    tags: [
      { tag: 'pages', value: '1084' },
      { tag: 'language', value: 'es' },
      { tag: 'subject', value: 'Fiction' },
      { tag: 'subject', value: 'Classic' },
    ],
  },
];
