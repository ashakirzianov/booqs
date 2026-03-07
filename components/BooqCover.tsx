import { urlForBooqImageVariant } from '@/common/href'
import { BooqId } from '@/core'
import React from 'react'

const defaultSize: BooqCoverSize = 240

export type BooqCoverSize = 60 | 120 | 240 | 360

export function BooqCover({ booqId, coverSrc, title, author, size }: {
    booqId: BooqId,
    coverSrc: string | undefined,
    title: string | undefined,
    author: string | undefined,
    size: BooqCoverSize,
}) {
    size = size ?? defaultSize
    const height = size
    const width = size / 3 * 2
    return <div className='flex shrink-0 items-stretch rounded-sm overflow-clip' style={{
        width: width,
        height: height,
    }}>
        {
            coverSrc
                ? <BooqImageCover coverUrl={urlForBooqImageVariant({ booqId, imageId: coverSrc, width: size })} title={title} />
                : <BooqDefaultCover title={title} author={author} size={size} />
        }
    </div>
}

function BooqImageCover({ coverUrl, title }: {
    coverUrl: string,
    title: string | undefined,
}) {
    return <div title={title ?? undefined} className='flex w-full h-full bg-contain bg-no-repeat bg-center' style={{
        backgroundImage: `url(${coverUrl})`,
    }} />
}

function BooqDefaultCover({ title, author, size }: {
    title: string | undefined,
    author: string | undefined,
    size: number,
}) {
    const { back, text } = colorForString(title ?? 'no-title' + author)
    return <div title={title ?? undefined} className='flex flex-row items-stretch' style={{
        width: size * 2,
    }}>
        <div className='flex flex-col grow items-center justify-center overflow-hidden text-ellipsis text-center p-[10%]' style={{
            fontSize: calcFontSize(title ?? 'no-title', size),
            background: back,
            color: text,
        }}>
            {title}
        </div>
    </div>
}

// TODO: rethink this
function calcFontSize(title: string, size: number) {
    const words = title
        .split(' ')
        .sort((a, b) => b.length - a.length)
    const maxLength = words[0]?.length ?? 0
    const count = title.length / 10
    const width = (size * 2) / maxLength
    const height = (size * 3) / count * 0.75
    const result = Math.floor(Math.min(width, height))
    return `${result}px`
}

function colorForString(s: string) {
    // TODO: more & better colors
    const coverColors: Array<{ back: string, text: string }> = [
        {
            back: 'linear-gradient(0deg, rgba(255,165,0,0.5) 0%, rgba(255,165,0,1) 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(0deg, rgba(102, 51, 153,0.5) 0%, rgba(102, 51, 153,1) 50%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(0deg, rgba(0,100,0,0.5) 0%, rgba(0,100,0,1) 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(0deg, rgba(65,105,225,0.5) 0%, rgba(65,105,225,1) 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(0deg, rgba(210,105,30,0.5) 0%, rgba(210,105,30,1) 100%)',
            text: 'white',
        },
        {
            back: 'black',
            text: 'white',
        },
    ]

    const rand = s
        .split('')
        .reduce((n, ch) => n + ch.charCodeAt(0), s.length)
    const idx = rand % coverColors.length

    return coverColors[idx]
}
