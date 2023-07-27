import { FeedLink } from '@/controls/Links'

export default function BooqNotFound() {
    return <div className='flex flex-col items-center justify-center h-screen w-screen font-main overflow-hidden text-2xl'>
        <h1>Page not found!</h1>
        <FeedLink>
            <span className='text-action hover:text-highlight'>
                Main page
            </span>
        </FeedLink>
    </div>
}