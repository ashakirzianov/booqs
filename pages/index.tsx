import { Page } from "../components/Page";
import { AppBar } from "../components/AppBar";
import { Featured } from "../components/Featured";
import { ReadingHistory } from "../components/ReadingHistory";
import { Collection } from "../components/Collection";

export default function Home() {
  return <Page title="Booqs">
    <AppBar />
    <ReadingHistory />
    <Featured />
    <style jsx>{`
      div {
        display: flex;
        flex-direction: column;
        border: 1px solid blue;
      }
      `}</style>
  </Page>;
}
