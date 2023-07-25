import { FeedLink } from '@/controls/Links'

export default function BooqNotFound() {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100svh',
        width: '100svw',
        fontFamily: 'var(--font-main)',
        overflow: 'hidden',
    }}>
        <h1>Booq not found!</h1>
        <FeedLink>
            <span className='text-action hover:text-highlight'>
                Main page
            </span>
        </FeedLink>
    </div>
}