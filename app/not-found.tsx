import { feedHref } from '@/common/href'
import Link from 'next/link'


export default function BooqNotFound() {
    return <div className='flex flex-col items-center justify-center h-screen w-screen font-main overflow-hidden text-2xl'>
        <h1>Page not found!</h1>
        <Link href={feedHref()} className='text-action hover:text-highlight'>
            Main Page
        </Link>
    </div>
}