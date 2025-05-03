import { feedHref } from '@/components/Links'
import Link from 'next/link'


export default function BooqNotFound() {
    return <div className='flex flex-col items-center justify-center h-screen w-screen font-main overflow-hidden text-2xl'>
        <h1>Page not found!</h1>
        <Link href={feedHref()}>
            <span className='text-action hover:text-highlight'>
                Main page
            </span>
        </Link>
    </div>
}