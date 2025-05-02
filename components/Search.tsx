'use client'
import { BooqCover } from '@/components/BooqCover'
import { authorHref, booqHref } from '@/components/Links'
import { Modal, useModalState } from './Modal'
import {
    AuthorSearchResult, BooqSearchResult,
    isAuthorSearchResult, isBooqSearchResult, useSearch,
} from '@/application/search'
import Link from 'next/link'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from './Icons'

export function Search() {
    const { isOpen, openModal, closeModal } = useModalState()
    return <>
        <input
            className='font-normal border-none text-xl shadow rounded p-4 max-h-12 w-40 bg-background cursor-pointer
            focus:max-w-auto focus:outline-hidden focus:ring-0 focus:border-none dark:shadow-slate-800
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
    const { push } = useRouter()
    const { query, doQuery, results, loading } = useSearch()
    const [selected, setSelected] = useState(0)
    const booqs = results.filter(isBooqSearchResult)
    const authors = results.filter(isAuthorSearchResult)
    return <Modal
        isOpen={isOpen}
        closeModal={closeModal}
    >
        <div className='flex flex-col h-[40rem] max-h-[90vh] w-panel max-w-[90vw] overflow-hidden' tabIndex={-1}
            onKeyDown={e => {
                if (e.key === 'Escape') {
                    closeModal()
                } else if (e.key === 'ArrowUp') {
                    setSelected(Math.max(0, selected - 1))
                } else if (e.key === 'ArrowDown') {
                    setSelected(Math.min(results.length - 1, selected + 1))
                } else if (e.key === 'Enter' && results.length > 0) {
                    if (selected < authors.length) {
                        const author = authors[selected]
                        push(authorHref(author.name))
                    } else {
                        const booq = booqs[selected - authors.length]
                        push(booqHref(booq.id, [0]))
                    }
                    closeModal()
                }
            }}
        >
            <input
                autoFocus={true}
                onFocus={e => e.target.select()}
                className='font-normal border-none text-xl p-4 w-full
            max-h-12 bg-background text-primary shadow
            focus:outline-hidden focus:ring-0 focus:border-none
            placeholder:text-dimmed'
                tabIndex={1}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => doQuery(e.target.value)}
            />
            <div className='flex flex-col grow overflow-y-auto'>
                {authors.length > 0
                    ? <div>
                        <h1 className='font-bold p-2 text-xl'>Authors</h1>
                        <ul>
                            {authors.map((result, idx) => <SearchResultItem
                                key={idx}
                                selected={selected === idx}
                            >
                                <AuthorSearchResultContent
                                    result={result}
                                    query={query}
                                />
                            </SearchResultItem>)}
                        </ul>
                    </div>
                    : null}
                {booqs.length > 0
                    ? <div>
                        <h1 className='font-bold p-2 text-xl'>Books</h1>
                        <ul>
                            {booqs.map((result, idx) => <SearchResultItem
                                key={idx}
                                selected={selected === (idx + authors.length)}
                            >
                                <BooqSearchResultContent
                                    result={result}
                                    query={query}
                                />
                            </SearchResultItem>)}
                        </ul>
                    </div>
                    : null}
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
        </div>
    </Modal>
}

function SearchResultItem({ selected, children }: {
    selected?: boolean,
    children: ReactNode,
}) {
    const ref = useRef<HTMLLIElement>(null)
    useEffect(() => {
        if (selected && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            })
        }
    }, [selected])
    return <li ref={ref} className='flex text-base transition-all duration-300 cursor-pointer p-base hover:bg-highlight hover:text-background' style={{
        background: selected ? 'var(--theme-highlight)' : undefined,
        color: selected ? 'var(--theme-background)' : undefined,
    }}>
        {children}
    </li>
}

function BooqSearchResultContent({ result, query }: {
    result: BooqSearchResult,
    query: string,
}) {
    return <Link href={booqHref(result.id, [0])} className='flex flex-row'>
        <BooqCover
            cover={result.cover}
            title={result.title}
            author={result.authors[0] ?? null}
            size={20}
        />
        <div className='flex flex-col my-0 mx-lg'>
            <EmphasizedSpan
                text={result.title ?? ''}
                emphasis={query}
            />
            <span>{result.authors[0]}</span>
        </div>
    </Link>
}

function AuthorSearchResultContent({ result, query }: {
    result: AuthorSearchResult,
    query: string,
    selected?: boolean,
}) {
    return <Link href={authorHref(result.name)}>
        <EmphasizedSpan
            text={result.name}
            emphasis={query}
        />
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
