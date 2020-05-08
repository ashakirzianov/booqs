import React, { useState } from 'react';
import { usePalette } from './theme';
import { meter, radius } from './meter';
import { BooqData, cards } from './data';
import { BooqCover } from './BooqCover';

export function Search() {
    const results = cards;
    const [query, setQuery] = useState('');
    const { primary, dimmed, background } = usePalette();
    return <div className='container'>
        <div className='content'>
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <div className='results'>
                {
                    results.map(
                        (card, idx) => <SearchResult
                            key={idx}
                            card={card}
                            query={query}
                        />
                    )
                }
            </div>
            <p className='shadow' />
        </div>
        <style jsx>{`
        .container {
            display: flex;
            flex-direction: row;
            flex: 0 1;
            align-items: flex-start;
            justify-content: flex-start;
            margin: 0 ${meter.xLarge};
            color: ${primary};
            max-height: 2rem;
            overflow: visible;
        }
        .content {
            display: flex;
            position: relative;
            top: -${meter.regular};
            flex-direction: column;
            background-color: ${background};
            border-radius: ${radius};
        }
        input {
            display: flex;
            border: none;
            margin: ${meter.regular} ${meter.regular} ${meter.regular} ${meter.large};
            font: inherit;
            font-size: x-large;
            background-color: rgba(0,0,0,0);
        }
        input:focus {
            border: none;
            outline: none;
        }
        input::placeholder {
            color: ${dimmed};
        }
        .results {
            display: none;
            flex-direction: column;
            border-bottom-left-radius: ${radius};
            border-bottom-right-radius: ${radius};
            overflow: hidden;
        }
        input:focus + .results {
            display: flex;
        }
        .shadow {
            position: absolute;
            z-index: -1;
            margin: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            border-radius: ${radius};
        }
        input:focus ~ .shadow {
            box-shadow: 0px 0px 7px rgba(0,0,0,0.1);
        }
        `}</style>
    </div>;
}

function SearchResult({ card, query }: {
    card: BooqData,
    query: string,
}) {
    const { highlight, light } = usePalette();
    return <div className='container'>
        <BooqCover
            cover={card.cover}
            title={card.title}
            author={card.author}
            size={20}
        />
        <div className='details'>
            <EmphasizedSpan
                text={card.title ?? ''}
                emphasis={query}
            />
            <EmphasizedSpan
                text={card.author ?? ''}
                emphasis={query}
            />
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                font-size: medium;
                padding: ${meter.regular};
                transition: background-color 0.25s, color 0.25s;
                cursor: pointer;
            }
            .container:hover {
                background-color: ${highlight};
                color: ${light};
            }
            .details {
                display: flex;
                flex-direction: column;
                margin: 0 ${meter.large};
            }
            `}</style>
    </div>
}

function EmphasizedSpan({ text, emphasis }: {
    text: string,
    emphasis: string,
}) {
    const spans = buildEmphasis(text, emphasis);
    return <span>
        {
            spans.map(
                (s, idx) => <span key={idx} style={{
                    fontWeight: s.emphasized
                        ? 'bold'
                        : undefined,
                }}>
                    {s.text}
                </span>
            )
        }
    </span>;
}

type AttributedSpan = {
    text: string,
    emphasized: boolean,
}
function buildEmphasis(text: string, emphasis: string): AttributedSpan[] {
    if (!emphasis.length) {
        return [{ text, emphasized: false }];
    }
    const index = text.toLowerCase().indexOf(emphasis.toLowerCase());
    if (index >= 0) {
        const pre = text.substr(0, index);
        const emp = text.substr(index, emphasis.length);
        const next = text.substr(index + emphasis.length);
        const nextSpans = buildEmphasis(next, emphasis);
        return [
            {
                text: pre,
                emphasized: false,
            },
            {
                text: emp,
                emphasized: true,
            },
            ...nextSpans,
        ];
    } else {
        return [{ text, emphasized: false }];
    }
}
