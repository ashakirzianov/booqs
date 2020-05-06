import { PageHead } from "../atoms/PageHead";
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
  return <div>
    <PageHead title="Booqs" />
    <AppBar />
    <Featured cards={cards} />
  </div>;
}

const cards: BooqCardProps[] = [
  {
    title: 'Republic',
    author: 'Plato',
    cover: 'https://booka-lib-images.s3.amazonaws.com/@cover@large@pg55201',
    tags: [],
    length: 312,
  },
  {
    title: 'Nausea',
    author: 'Sartre',
    cover: 'https://booqs-uploads-images.s3.amazonaws.com/@cover@large@nausea',
    tags: [],
    length: 102,
  },
  {
    title: 'Rayuela',
    author: 'Cortázar',
    cover: 'https://booqs-uploads-images.s3.amazonaws.com/@cover@large@igra-v-klassiki',
    tags: [],
    length: 1084,
  },
];
