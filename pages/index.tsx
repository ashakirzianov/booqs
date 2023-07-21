import { GetStaticProps } from 'next'
import { FeaturedItem, fetchFeatured } from 'app'
import { Page } from 'components/Page'
import { AppBar } from 'components/AppBar'
import { Featured } from 'components/Featured'
import { ReadingHistory } from 'components/ReadingHistory'

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
    const featured = await fetchFeatured()
    return {
        props: {
            featured,
        }
    }
}

type HomeProps = {
    featured: FeaturedItem[],
};
export default function Home({ featured }: HomeProps) {
    return <Page title="Booqs">
        <AppBar />
        <ReadingHistory />
        <Featured cards={featured} />
    </Page>
}
