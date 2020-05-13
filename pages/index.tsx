import { Page } from "../components/Page";
import { AppBar } from "../components/AppBar";
import { BooqData, cards, previews, Preview } from "../controls/data";
import { Featured } from "../components/Featured";
import { ReadingHistory } from "../components/ReadingHistory";

export async function getStaticProps() {
  return {
    props: {
      cards,
      previews,
    },
  };
}

export default function Home({ cards, previews }: {
  cards: BooqData[],
  previews: Preview[],
}) {
  return <Page title="Booqs">
    <AppBar />
    <ReadingHistory />
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
