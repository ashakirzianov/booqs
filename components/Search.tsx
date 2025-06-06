'use client'
import { BooqCover } from '@/components/BooqCover'
import { authorHref, booqHref, searchHref } from '@/application/href'
import { Modal, useModalState } from './Modal'
import { useSearch } from '@/application/search'
import Link from 'next/link'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from './Icons'
import { useDebouncedValue } from '@/application/utils'
import { AuthorSearchResult, BooqSearchResult } from '@/core'

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
    const [input, setInput] = useState('')
    const debouncedInput = useDebouncedValue(input, 300)
    const { query, results, isLoading } = useSearch({
        query: debouncedInput,
    })
    const [selected, setSelected] = useState<number | null>(null)
    const booqs = results.filter(r => r.kind === 'book')
    const authors = results.filter(r => r.kind === 'author')
    const router = useRouter()
    return <Modal
        isOpen={isOpen}
        closeModal={closeModal}
    >
        <div className='flex flex-col h-[40rem] max-h-[90vh] w-panel max-w-[90vw] overflow-hidden' tabIndex={-1}
            onKeyDown={e => {
                if (e.key === 'Escape') {
                    closeModal()
                } else if (e.key === 'ArrowUp') {
                    setSelected(Math.max(0, (selected ?? 0) - 1))
                } else if (e.key === 'ArrowDown') {
                    setSelected(Math.min(results.length - 1, (selected ?? 0) + 1))
                } else if (e.key === 'Enter') {
                    if (selected !== null && results.length > 0) {
                        if (selected < authors.length) {
                            const author = authors[selected]
                            push(authorHref({ name: author.author.name }))
                        } else {
                            const booq = booqs[selected - authors.length]
                            push(booqHref({ id: booq.card.id, path: [0] }))
                        }
                        closeModal()
                    } else {
                        router.push(searchHref({ query: input }))
                        closeModal()
                    }
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
                value={input}
                onChange={e => setInput(e.target.value)}
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
                    isLoading
                        ? <div key='spinner' className='self-center m-lg w-8 h-8'><Spinner /></div>
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

function BooqSearchResultContent({ result: { card }, query }: {
    result: BooqSearchResult,
    query: string,
}) {
    return <Link href={booqHref({ id: card.id, path: [0] })} className='flex flex-row'>
        <BooqCover
            coverUrl={card.coverUrl ?? undefined}
            title={card.title ?? undefined}
            author={card.authors[0] ?? null}
            size={20}
        />
        <div className='flex flex-col my-0 mx-lg'>
            <EmphasizedSpan
                text={card.title ?? ''}
                emphasis={query}
            />
            <span>{card.authors[0]}</span>
        </div>
    </Link>
}

function AuthorSearchResultContent({ result: { author }, query }: {
    result: AuthorSearchResult,
    query: string,
    selected?: boolean,
}) {
    return <Link href={authorHref({ name: author.name })}>
        <EmphasizedSpan
            text={author.name}
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
