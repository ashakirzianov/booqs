import React from 'react';

const coverWidth = 140;
const coverHeight = 210;

export function BooqCover({ cover, title, author }: {
    cover?: string,
    title?: string,
    author?: string,
}) {
    return <div>
        {
            cover
                ? <BooqImageCover cover={cover} title={title} />
                : <BooqDefaultCover title={title} author={author} />
        }
        <style jsx>{`
            div {
                display: flex;
                flex-shrink: 0;
                width: ${coverWidth}px;
                height: ${coverHeight}px;
                align-items: stretch;
                // border-radius: 5px;
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

function BooqDefaultCover({ title, author }: {
    title?: string,
    author?: string,
}) {
    const { back, text } = colorForString(title ?? 'no-title' + author);
    return <div title={title} className=".container">
        <div style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            paddingTop: 20,
            paddingLeft: 5,
            paddingRight: 5,
            fontSize: calcFontSize(title ?? 'no-title'),
            background: back,
            color: text,
        }}>
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
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
                padding: 20px 5px 0px 5px;
                font-size: ${calcFontSize(title ?? 'no-title')};
                background: ${back};
                color: text;
            }
            `}</style>
    </div>;
}

// TODO: rethink this
function calcFontSize(title: string) {
    const words = title
        .split(' ')
        .sort((a, b) => b.length - a.length);
    const maxLength = words[0]?.length ?? 0;
    const count = title.length / 10;
    const width = coverWidth / maxLength;
    const height = coverHeight / count * 0.75;
    const size = Math.floor(Math.min(width, height));
    return `${size}px`;
}

function colorForString(s: string) {
    // TODO: more & better colors
    const coverColors: Array<{ back: string, text: string }> = [
        {
            back: 'linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(90deg, #e3ffe7 0%, #d9e7ff 100%)',
            text: 'steelblue',
        },
        {
            back: 'linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(90deg, #fcff9e 0%, #c67700 100%)',
            text: 'white',
        },
        {
            back: 'linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%)',
            text: 'white',
        },
    ];

    const rand = s
        .split('')
        .reduce((n, ch) => n + ch.charCodeAt(0), s.length);
    const idx = rand % coverColors.length;

    return coverColors[idx];
}
