import React from 'react'
import { useSearch, SearchResult } from '@/application'
import { BooqCover } from '@/controls/BooqCover'
import { Spinner } from '@/controls/Spinner'
import { BooqLink } from '@/controls/Links'
import styles from './Search.module.css'

export function Search() {
    const { query, doQuery, results, loading } = useSearch()
    return <div className='flex grow-0 items-start justify-start text-primary max-h-12 overflow-visible'>
        <div className='flex flex-col relative rounded bg-background'>
            <input
                className={`${styles.input} font-normal my-base mx-lg flex border-none max-w-[7rem] text-xl text-primary bg-transparent
                focus:max-w-auto focus:outline-none focus:ring-0 focus:border-none
                placeholder:text-dimmed`}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => doQuery(e.target.value)}
            />
            <div className={`${styles.results} flex-col overflow-hidden rounded-b`}>
                <SearchResults
                    results={results}
                    query={query}
                    loading={loading}
                />
            </div>
            <p className={`${styles.shadow} shadow rounded`} />
        </div>
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
    return <div className='flex flex-col max-h-80 overflow-hidden hover:overflow-auto'>
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
    </div>
}

function SingleResult({ result, query }: {
    result: SearchResult,
    query: string,
}) {
    return <BooqLink booqId={result.id} path={[0]}>
        <div className='flex text-base transition-all duration-300 cursor-pointer p-base hover:bg-highlight hover:text-background'>
            <BooqCover
                cover={result.cover}
                title={result.title}
                author={result.author}
                size={20}
            />
            <div className='flex flex-col my-0 mx-lg'>
                <EmphasizedSpan
                    text={result.title ?? ''}
                    emphasis={query}
                />
                <EmphasizedSpan
                    text={result.author ?? ''}
                    emphasis={query}
                />
            </div>
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
        const pre = text.substring(0, index)
        const emp = text.substring(index, index + emphasis.length)
        const next = text.substring(index + emphasis.length)
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
