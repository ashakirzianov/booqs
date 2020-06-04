import React from 'react';
import { radius } from './theme';

const defaultSize = 70;

export function BooqCover({ cover, title, author, size }: {
    cover?: string,
    title?: string,
    author?: string,
    size?: number,
}) {
    size = size ?? defaultSize;
    return <div>
        {
            cover
                ? <BooqImageCover cover={cover} title={title} />
                : <BooqDefaultCover title={title} author={author} size={size} />
        }
        <style jsx>{`
            div {
                display: flex;
                flex-shrink: 0;
                width: ${size * 2}px;
                height: ${size * 3}px;
                align-items: stretch;
                border-radius: ${radius};
                overflow: hidden;
            }
            `}</style>
    </div>;
}

function BooqImageCover({ cover, title }: {
    cover: string,
    title?: string,
}) {
    return <div title={title}>
        <style jsx>{`
            div {
                display: flex;
                width: 100%;
                height: 100%;
                background-image: url(${cover});
                background-size: cover;
                background-repeat: no-repeat;
            }
            `}</style>
    </div>;
}

function BooqDefaultCover({ title, author, size }: {
    title?: string,
    author?: string,
    size: number,
}) {
    const { back, text } = colorForString(title ?? 'no-title' + author);
    return <div title={title} className='container'>
        <div className='cover'>
            {title}
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                flex: 1;
                align-items: stretch;
            }
            .cover {
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
                padding: 10%;
                font-size: ${calcFontSize(title ?? 'no-title', size)};
                background: ${back};
                color: ${text};
            }
            `}</style>
    </div>;
}

// TODO: rethink this
function calcFontSize(title: string, size: number) {
    const words = title
        .split(' ')
        .sort((a, b) => b.length - a.length);
    const maxLength = words[0]?.length ?? 0;
    const count = title.length / 10;
    const width = (size * 2) / maxLength;
    const height = (size * 3) / count * 0.75;
    const result = Math.floor(Math.min(width, height));
    return `${result}px`;
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
    ];

    const rand = s
        .split('')
        .reduce((n, ch) => n + ch.charCodeAt(0), s.length);
    const idx = rand % coverColors.length;

    return coverColors[idx];
}
