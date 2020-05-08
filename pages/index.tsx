import { Page } from "../atoms/Page";
import { AppBar } from "../atoms/AppBar";
import { BooqCardProps } from "../atoms/BooqCard";
import { Featured } from "../atoms/Featured";
import { Preview } from "../atoms/BooqPreview";
import { Positions } from "../atoms/Positions";

export async function getStaticProps() {
  return {
    props: {
      cards,
      previews,
    },
  };
}

export default function Home({ cards, previews }: {
  cards: BooqCardProps[],
  previews: Preview[],
}) {
  return <Page title="Booqs">
    <AppBar />
    <Positions previews={previews} />
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

const previews: Preview[] = [
  {
    title: 'The Fantastic Booq',
    text: 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.',
    page: 52,
    length: 278,
  },
]
