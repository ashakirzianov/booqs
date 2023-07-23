import { BooqPath } from '@/core'
import { PropsType } from './utils'

export type BooqPreviewProps = PropsType<typeof BooqPreview>;

export function BooqPreview({
    text,
    title,
    page,
}: {
    path: BooqPath,
    text: string,
    title: string,
    page: number,
    total: number,
}) {
    return (
        <div className="flex-grow shrink-0 basis-auto w-[75vw] rounded items-center font-book text-lg cursor-pointer px-8 py-12 max-w-[400px] border border-gray-300 shadow-md transition-shadow hover:shadow-lg">
            <span className="text-dimmed dark:text-dark-dimmed text-center overflow-hidden overflow-ellipsis whitespace-nowrap">{title}</span>
            <div className="text-justify text-gray-700 my-4 line-clamp-6">{text}</div>
            <div className="text-dimmed dark:text-dark-dimmed">{page}</div>
        </div>
    )
}