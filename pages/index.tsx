import { Page } from "../atoms/Page";
import { AppBar } from "../atoms/AppBar";
import { BooqData, cards, previews, Preview } from "../atoms/data";
import { Featured } from "../atoms/Featured";
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
  cards: BooqData[],
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
