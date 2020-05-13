import { Page } from "../controls/Page";
import { AppBar } from "../controls/AppBar";
import { BooqData, cards, previews, Preview } from "../controls/data";
import { Featured } from "../controls/Featured";
import { ReadingHistory } from "../controls/ReadingHistory";

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
