import { Page } from "../components/Page";
import { AppBar } from "../components/AppBar";
import { Featured } from "../components/Featured";
import { ReadingHistory } from "../components/ReadingHistory";

export default function Home() {
  return <Page title="Booqs">
    <AppBar />
    <ReadingHistory />
    <Featured />
  </Page>;
}
