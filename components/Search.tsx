'use client'
import { useEffect, useRef } from 'react'
import { BooqCover } from '@/components/BooqCover'
import { Spinner } from '@/components/Loading'
import { BooqLink, authorHref } from '@/components/Links'
import { Modal, useModalState } from './Modal'
import { AuthorSearchResult, BooqSearchResult, SearchResult, isAuthorSearchResult, isBooqSearchResult, useSearch } from '@/application/search'
import Link from 'next/link'

export function Search() {
    let { isOpen, openModal, closeModal } = useModalState()
    return <>
        <input
            className='font-normal border-none text-xl shadow rounded p-4
            max-h-12 w-40 
            focus:max-w-auto focus:outline-none focus:ring-0 focus:border-none
            placeholder:text-dimmed'
            type="text"
            placeholder="Search..."
            onClick={openModal}
            readOnly
        />
        <SearchModal
            isOpen={isOpen}
            closeModal={closeModal}
        />
    </>
}

function SearchModal({
    isOpen, closeModal,
}: {
    isOpen: boolean,
    closeModal: () => void,
}) {
    const { query, doQuery, results, loading } = useSearch()
    let inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isOpen])
    return <Modal
        isOpen={isOpen}
        closeModal={closeModal}
    >
        <div className='flex flex-col h-[40rem] max-h-[90vh] w-panel max-w-[90vw] overflow-hidden' tabIndex={-1}>
            <input
                ref={inputRef}
                className='font-normal border-none text-xl p-4 w-full
            max-h-12
            focus:outline-none focus:ring-0 focus:border-none
            placeholder:text-dimmed'
                tabIndex={1}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => doQuery(e.target.value)}
            />
            <SearchResults
                query={query}
                results={results}
                loading={loading}
            />
        </div>
    </Modal>
}

function SearchResults({ loading, query, results }: {
    results: SearchResult[],
    query: string,
    loading: boolean,
}) {
    let booqs = results.filter(isBooqSearchResult)
    let authors = results.filter(isAuthorSearchResult)
    let booqsNode = booqs.length > 0
        ? <div>
            <h1 className='font-bold p-2'>Books</h1>
            {
                booqs.map(
                    (result, idx) => <div key={idx} className='result'>
                        <BooqSearchResult
                            result={result}
                            query={query}
                        />
                    </div>
                )
            }
        </div>
        : null
    let authorsNode = authors.length > 0
        ? <div>
            <h1 className='font-bold p-2'>Authors</h1>
            {
                authors.map(
                    (result, idx) => <div key={idx} className='result'>
                        <AuthorSearchResult
                            result={result}
                            query={query}
                        />
                    </div>
                )
            }
        </div>
        : null
    return <div className='flex flex-col grow overflow-y-auto'>
        {
            results[0]?.__typename === 'Author'
                ? <>
                    {authorsNode}
                    {booqsNode}
                </>
                : <>
                    {booqsNode}
                    {authorsNode}
                </>
        }
        {
            loading
                ? <div key='spinner' className='self-center m-lg'><Spinner /></div>
                : results.length === 0
                    ? <div className='text-center text-dimmed p-base'>
                        No results
                    </div>
                    : null
        }
    </div>
}

function BooqSearchResult({ result, query }: {
    result: BooqSearchResult,
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
                <span>{result.author}</span>
            </div>
        </div>
    </BooqLink>
}

function AuthorSearchResult({ result, query }: {
    result: AuthorSearchResult,
    query: string,
}) {
    return <Link href={authorHref(result.name)}>
        <div className='flex text-base transition-all duration-300 cursor-pointer p-base hover:bg-highlight hover:text-background'>
            <div className='flex flex-col my-0'>
                <EmphasizedSpan
                    text={result.name}
                    emphasis={query}
                />
            </div>
        </div>
    </Link>
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
