import { BooqPath } from '@/core'

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
        <div className="flex flex-col flex-grow shrink-0 basis-auto w-[90vw] rounded items-center font-book text-lg cursor-pointer px-8 p-4 max-w-[400px] border border-gray-300 shadow-md transition-shadow hover:shadow-lg">
            <span className="truncate text-dimmed dark:text-dark-dimmed text-center w-full p-1">{title}</span>
            <div className="text-justify text-gray-700 text-sm my-4 line-clamp-6">{text}</div>
            <div className="text-dimmed dark:text-dark-dimmed">{page}</div>
        </div>
    )
}