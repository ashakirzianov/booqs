import React from 'react'
import { useSearch, SearchResult } from '@/application'
import { BooqCover } from '@/controls/BooqCover'
import { Spinner } from '@/controls/Spinner'
import { BooqLink } from '@/controls/Links'

export function Search() {
    const { query, doQuery, results, loading } = useSearch()
    return <div className='container'>
        <div className='content rounded'>
            <input
                className='font-normal my-base mx-lg'
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => doQuery(e.target.value)}
            />
            <div className='results rounded-b'>
                <SearchResults
                    results={results}
                    query={query}
                    loading={loading}
                />
            </div>
            <p className='shadow rounded' />
        </div>
        <style jsx>{`
        .container {
            display: flex;
            flex-direction: row;
            flex: 0 1;
            align-items: flex-start;
            justify-content: flex-start;
            margin: 0;
            color: var(--theme-primary);
            max-height: 3rem;
            overflow: visible;
        }
        .content {
            display: flex;
            position: relative;
            flex-direction: column;
            background-color: var(--theme-background);
        }
        input {
            display: flex;
            border: none;
            max-width: 7rem;
            font: inherit;
            font-size: x-large;
            color: var(--theme-primary);
            background-color: rgba(0,0,0,0);
        }
        input:focus {
            max-width: auto;
            border: none;
            outline: none;
        }
        input::placeholder {
            color: var(--theme-dimmed);
        }
        .results {
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        input:focus + .results {
            display: flex;
        }
        .results:hover {
            display: flex;
        }
        .shadow {
            position: absolute;
            margin: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            transition: 250ms box-shadow;
        }
        input:focus ~ .shadow {
            box-shadow: 0px 0px 7px rgba(0,0,0,0.1);
            border: 1px solid var(--theme-border);
        }
        `}</style>
    </div>
}

function SearchResults({ loading, query, results }: {
    results: SearchResult[],
    query: string,
    loading: boolean,
}) {
    if (!results.length) {
        return null
    }
    return <div className='container'>
        {
            results.map(
                (result, idx) => <div key={idx} className='result'>
                    <SingleResult
                        result={result}
                        query={query}
                    />
                </div>
            )
        }
        {
            loading
                ? <div key='spinner' className='self-center m-lg'><Spinner /></div>
                : null
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: column;
                max-height: 19rem;
                overflow: hidden;
            }
            .container:hover {
                overflow: auto;
            }
            `}</style>
    </div>
}

function SingleResult({ result, query }: {
    result: SearchResult,
    query: string,
}) {
    return <BooqLink booqId={result.id} path={[0]}>
        <div className='container p-base'>
            <BooqCover
                cover={result.cover}
                title={result.title}
                author={result.author}
                size={20}
            />
            <div className='details my-0 mx-lg'>
                <EmphasizedSpan
                    text={result.title ?? ''}
                    emphasis={query}
                />
                <EmphasizedSpan
                    text={result.author ?? ''}
                    emphasis={query}
                />
            </div>
            <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                font-size: medium;
                transition: background-color 0.25s, color 0.25s;
                cursor: pointer;
            }
            .container:hover {
                background-color: var(--theme-highlight);
                color: var(--theme-background);
            }
            .details {
                display: flex;
                flex-direction: column;
            }
            `}</style>
        </div>
    </BooqLink>
}

function EmphasizedSpan({ text, emphasis }: {
    text: string,
    emphasis: string,
}) {
    const spans = buildEmphasis(text, emphasis)
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
    </span>
}

type AttributedSpan = {
    text: string,
    emphasized: boolean,
}
function buildEmphasis(text: string, emphasis: string): AttributedSpan[] {
    if (!emphasis.length) {
        return [{ text, emphasized: false }]
    }
    const index = text.toLowerCase().indexOf(emphasis.toLowerCase())
    if (index >= 0) {
        const pre = text.substr(0, index)
        const emp = text.substr(index, emphasis.length)
        const next = text.substr(index + emphasis.length)
        const nextSpans = buildEmphasis(next, emphasis)
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
        ]
    } else {
        return [{ text, emphasized: false }]
    }
}
