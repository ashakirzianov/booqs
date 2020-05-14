import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { usePalette } from '../app';
import { normalWeight, meter, radius } from '../controls/theme';
import { BooqCover } from '../controls/BooqCover';
import { useQuery } from '@apollo/react-hooks';
import { Spinner } from '../controls/Spinner';

const SearchQuery = gql`query Search($query: String!) {
    search(query: $query) {
        title
        author
        cover(size: 60)
    }
}`;
type SearchData = {
    search: {
        title?: string,
        author?: string,
        cover?: string,
    }[],
};
function useSearch() {
    const [query, setQuery] = useState('');
    const { loading, data } = useQuery<SearchData>(
        SearchQuery,
        { variables: { query } },
    );

    return {
        query,
        doQuery: setQuery,
        results: data?.search ?? [],
        loading,
    };
}

export function Search() {
    const { primary, dimmed, background } = usePalette();
    const { query, doQuery, results, loading } = useSearch();
    return <div className='container'>
        <div className='content'>
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => doQuery(e.target.value)}
            />
            <div className='results'>
                <SearchResults
                    results={results}
                    query={query}
                    loading={loading}
                />
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
            font-weight: ${normalWeight};
            color: ${primary};
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

type SearchResult = SearchData['search'][number];
function SearchResults({ loading, query, results }: {
    results: SearchResult[],
    query: string,
    loading: boolean,
}) {
    return <div className='container'>
        {
            results.map(
                (result, idx) => <div key={idx} className='result'>
                    <SearchResult
                        result={result}
                        query={query}
                    />
                </div>
            )
        }
        {
            loading
                ? <div key='spinner' className='spinner'><Spinner /></div>
                : null
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: column;
            }
            .spinner {
                align-self: center;
                margin: ${meter.large};
            }
            `}</style>
    </div>;
}

function SearchResult({ result, query }: {
    result: SearchResult,
    query: string,
}) {
    const { highlight, background } = usePalette();
    return <div className='container'>
        <BooqCover
            cover={result.cover}
            title={result.title}
            author={result.author}
            size={20}
        />
        <div className='details'>
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
                padding: ${meter.regular};
                transition: background-color 0.25s, color 0.25s;
                cursor: pointer;
            }
            .container:hover {
                background-color: ${highlight};
                color: ${background};
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
