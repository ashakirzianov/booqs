'use client'
import { useEffect, useRef, useState } from 'react'
import { BooqCover } from '@/components/BooqCover'
import { Spinner } from '@/components/Loading'
import { BooqLink } from '@/components/Links'
import { Modal, useModalState } from './Modal'

type SearchResult = {
    id: string,
    title?: string,
    author?: string,
    cover?: string,
}

export function Search({ query, doQuery, results, loading }: {
    query: string,
    doQuery: (query: string) => void,
    results: SearchResult[],
    loading: boolean,
}) {
    let { isOpen, openModal, closeModal } = useModalState()
    return <>
        <input
            className='font-normal border-none text-xl shadow rounded p-4
            max-h-12 w-40 
            focus:max-w-auto focus:outline-none focus:ring-0 focus:border-none
            placeholder:text-dimmed'
            type="text"
            placeholder="Search..."
            value={query}
            onClick={openModal}
            readOnly
        />
        <SearchModal
            isOpen={isOpen}
            closeModal={closeModal}
            query={query}
            doQuery={doQuery}
            results={results}
            loading={loading}
        />
    </>
}

function SearchModal({
    isOpen, closeModal,
    query, doQuery, results, loading,
}: {
    isOpen: boolean,
    closeModal: () => void,
    query: string,
    doQuery: (query: string) => void,
    results: SearchResult[],
    loading: boolean,
}) {
    let inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])
    return <Modal
        isOpen={isOpen}
        closeModal={closeModal}
    >
        <div className='w-panel' tabIndex={-1}>
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
