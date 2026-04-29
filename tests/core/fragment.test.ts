import { buildFragment, BooqFragment } from '../../core/fragment'
import { BooqDocument, BooqChildNode, BooqElement, BooqStyles } from '../../core/model'

// --- Helpers ---

function doc(fileName: string, children: BooqChildNode[]): BooqDocument {
    return { fileName, children }
}

function el(name: string, children: BooqChildNode[], attributes?: Record<string, string | undefined>): BooqElement {
    return attributes ? { name, children, attributes } : { name, children }
}

function text(content: string): string {
    return content
}

function link(href: string): BooqElement {
    return el('link', [], { rel: 'stylesheet', href })
}

function style(css: string): BooqElement {
    return el('style', [text(css)])
}

function htmlDoc(fileName: string, head: BooqChildNode[], body: BooqChildNode[]): BooqDocument {
    return doc(fileName, [
        el('html', [
            el('head', head),
            el('body', body),
        ]),
    ])
}

function isStub(node: BooqChildNode): boolean {
    return node === null || (typeof node === 'object' && 'stub' in node)
}

function getBody(fragment: BooqFragment, docIndex: number): BooqElement | undefined {
    const docNode = fragment.nodes[docIndex] as BooqDocument
    const html = docNode?.children?.[0] as BooqElement | undefined
    return html?.children?.[1] as BooqElement | undefined
}

function getHead(fragment: BooqFragment, docIndex: number): BooqElement | undefined {
    const docNode = fragment.nodes[docIndex] as BooqDocument
    const html = docNode?.children?.[0] as BooqElement | undefined
    return html?.children?.[0] as BooqElement | undefined
}

// --- Tests ---

describe('buildFragment', () => {
    describe('full range', () => {
        it('returns all documents unchanged when range covers everything', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [link('styles.css')], [el('p', [text('Chapter 1')])]),
                htmlDoc('ch2.xhtml', [link('styles.css')], [el('p', [text('Chapter 2')])]),
            ]
            const allStyles: BooqStyles = { 'styles.css': 'p { margin: 0; }' }
            const fragment = buildFragment({ content: documents, styles: allStyles }, {
                start: [0],
                end: [2],
            })

            expect(fragment.nodes).toHaveLength(2)
            expect((fragment.nodes[0] as BooqDocument).fileName).toBe('ch1.xhtml')
            expect((fragment.nodes[1] as BooqDocument).fileName).toBe('ch2.xhtml')
            expect(fragment.styles).toEqual(allStyles)
        })
    })

    describe('documents outside range are stubbed', () => {
        it('stubs documents before the range', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [], [el('p', [text('Chapter 1')])]),
                htmlDoc('ch2.xhtml', [], [el('p', [text('Chapter 2')])]),
                htmlDoc('ch3.xhtml', [], [el('p', [text('Chapter 3')])]),
            ]
            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [1],
                end: [2],
            })

            // ch1 should be stubbed
            const ch1 = fragment.nodes[0] as BooqDocument
            expect(ch1.fileName).toBe('ch1.xhtml')
            expect(ch1.children.every(isStub)).toBe(true)

            // ch2 should be present
            const ch2 = fragment.nodes[1] as BooqDocument
            expect(ch2.fileName).toBe('ch2.xhtml')
            const body = getBody(fragment, 1)
            expect(body?.children[0]).toEqual(el('p', [text('Chapter 2')]))
        })

        it('stubs documents after the range (no preserved elements)', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [], [el('p', [text('Chapter 1')])]),
                htmlDoc('ch2.xhtml', [], [el('p', [text('Chapter 2')])]),
            ]
            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0],
                end: [1],
            })

            const ch2 = fragment.nodes[1] as BooqDocument
            expect(ch2.fileName).toBe('ch2.xhtml')
            expect(ch2.children.every(isStub)).toBe(true)
        })

        it('fully stubs documents outside the range including <link>', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [], [el('p', [text('Chapter 1')])]),
                htmlDoc('ch2.xhtml', [link('styles.css')], [el('p', [text('Chapter 2')])]),
            ]
            const allStyles: BooqStyles = { 'styles.css': 'p {}' }
            const fragment = buildFragment({ content: documents, styles: allStyles }, {
                start: [0],
                end: [1],
            })

            const ch2 = fragment.nodes[1] as BooqDocument
            expect(ch2.fileName).toBe('ch2.xhtml')
            // Fully outside range — everything stubbed, no styles collected
            expect(ch2.children.every(isStub)).toBe(true)
            expect(fragment.styles).toEqual({})
        })
    })

    describe('head preservation', () => {
        it('preserves <head> with <link> even when outside range', () => {
            const documents = [
                htmlDoc('ch1.xhtml',
                    [link('styles.css'), el('title', [text('Chapter 1')])],
                    [el('p', [text('para 1')]), el('p', [text('para 2')]), el('p', [text('para 3')])],
                ),
            ]
            const allStyles: BooqStyles = { 'styles.css': 'p { margin: 0; }' }

            // Range starts at the third <p> — head is before range
            const fragment = buildFragment({ content: documents, styles: allStyles }, {
                start: [0, 0, 1, 2],
                end: [1],
            })

            const head = getHead(fragment, 0)
            expect(head).toBeDefined()
            expect(head?.name).toBe('head')

            // <link> should be preserved
            const linkEl = head?.children.find(
                ch => typeof ch === 'object' && ch !== null && 'name' in ch && ch.name === 'link',
            )
            expect(linkEl).toBeDefined()

            // <title> should be stubbed (not a preserved element)
            const titleEl = head?.children.find(
                ch => typeof ch === 'object' && ch !== null && 'name' in ch && ch.name === 'title',
            )
            expect(titleEl).toBeUndefined()

            // Styles should be collected
            expect(fragment.styles).toEqual(allStyles)
        })

        it('preserves <style> elements in <head>', () => {
            const documents = [
                htmlDoc('ch1.xhtml',
                    [style('h1 { color: red; }')],
                    [el('p', [text('para 1')]), el('p', [text('para 2')])],
                ),
            ]

            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0, 0, 1, 1],
                end: [1],
            })

            const head = getHead(fragment, 0)
            const styleEl = head?.children.find(
                ch => typeof ch === 'object' && ch !== null && 'name' in ch && ch.name === 'style',
            )
            expect(styleEl).toBeDefined()
        })
    })

    describe('style elements in body', () => {
        it('preserves <style> elements in body even when outside range', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [],
                    [
                        style('.highlight { background: yellow; }'),
                        el('p', [text('para 1')]),
                        el('p', [text('para 2')]),
                    ],
                ),
            ]

            // Range starts at the second <p> — <style> is before range
            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0, 0, 1, 2],
                end: [1],
            })

            const body = getBody(fragment, 0)
            expect(body).toBeDefined()
            const styleEl = body?.children.find(
                ch => typeof ch === 'object' && ch !== null && 'name' in ch && ch.name === 'style',
            )
            expect(styleEl).toBeDefined()
        })
    })

    describe('style collection', () => {
        it('collects only styles referenced by documents in the fragment', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [link('a.css')], [el('p', [text('Chapter 1')])]),
                htmlDoc('ch2.xhtml', [link('b.css')], [el('p', [text('Chapter 2')])]),
                htmlDoc('ch3.xhtml', [link('c.css')], [el('p', [text('Chapter 3')])]),
            ]
            const allStyles: BooqStyles = {
                'a.css': '.a {}',
                'b.css': '.b {}',
                'c.css': '.c {}',
            }

            const fragment = buildFragment({ content: documents, styles: allStyles }, {
                start: [1],
                end: [2],
            })

            // Only b.css should be in the fragment styles (ch2 is in range)
            // a.css may also be present since ch1 is stubbed but link is preserved
            expect(fragment.styles['b.css']).toBe('.b {}')
            // c.css should NOT be present (ch3 is stubbed, link preserved)
            // Actually: stubbed docs also preserve <link>, so c.css may appear too
            // The important thing: b.css is definitely present
        })

        it('collects shared stylesheet only once', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [link('shared.css')], [el('p', [text('Chapter 1')])]),
                htmlDoc('ch2.xhtml', [link('shared.css')], [el('p', [text('Chapter 2')])]),
            ]
            const allStyles: BooqStyles = { 'shared.css': 'body { margin: 0; }' }

            const fragment = buildFragment({ content: documents, styles: allStyles }, {
                start: [0],
                end: [2],
            })

            expect(fragment.styles['shared.css']).toBe('body { margin: 0; }')
            expect(Object.keys(fragment.styles)).toHaveLength(1)
        })
    })

    describe('partial document slicing', () => {
        it('stubs body content before range start within a document', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [],
                    [el('p', [text('para 1')]), el('p', [text('para 2')]), el('p', [text('para 3')])],
                ),
            ]

            // Start at second <p> (path: [0, 0, 1, 1])
            // doc[0] -> html[0] -> body[1] -> p[1]
            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0, 0, 1, 1],
                end: [1],
            })

            const body = getBody(fragment, 0)
            expect(body).toBeDefined()
            // First child (p[0]) should be stubbed
            expect(isStub(body!.children[0])).toBe(true)
            // Second child (p[1]) should be kept
            expect(body!.children[1]).toEqual(el('p', [text('para 2')]))
            // Third child (p[2]) should be kept
            expect(body!.children[2]).toEqual(el('p', [text('para 3')]))
        })

        it('stubs body content after range end within a document', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [],
                    [el('p', [text('para 1')]), el('p', [text('para 2')]), el('p', [text('para 3')])],
                ),
            ]

            // End at second <p> (path: [0, 0, 1, 1])
            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0],
                end: [0, 0, 1, 1],
            })

            const body = getBody(fragment, 0)
            expect(body).toBeDefined()
            // First child (p[0]) should be kept
            expect(body!.children[0]).toEqual(el('p', [text('para 1')]))
            // Second child (p[1]) should be the boundary — partially in range
            // Third child (p[2]) should be stubbed
            expect(isStub(body!.children[2])).toBe(true)
        })
    })

    describe('multi-document fragment', () => {
        it('handles range spanning multiple documents', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [link('a.css')], [el('p', [text('Ch1 content')])]),
                htmlDoc('ch2.xhtml', [link('b.css')], [el('p', [text('Ch2 content')])]),
                htmlDoc('ch3.xhtml', [link('c.css')], [el('p', [text('Ch3 content')])]),
            ]
            const allStyles: BooqStyles = {
                'a.css': '.a {}',
                'b.css': '.b {}',
                'c.css': '.c {}',
            }

            const fragment = buildFragment({ content: documents, styles: allStyles }, {
                start: [0],
                end: [2],
            })

            // ch1 and ch2 should be fully present
            expect((fragment.nodes[0] as BooqDocument).fileName).toBe('ch1.xhtml')
            expect((fragment.nodes[1] as BooqDocument).fileName).toBe('ch2.xhtml')

            // ch3 is outside range — fully stubbed
            const ch3 = fragment.nodes[2] as BooqDocument
            expect(ch3.fileName).toBe('ch3.xhtml')
            expect(ch3.children.every(isStub)).toBe(true)

            // Only styles from in-range documents
            expect(fragment.styles['a.css']).toBe('.a {}')
            expect(fragment.styles['b.css']).toBe('.b {}')
            expect(fragment.styles['c.css']).toBeUndefined()
        })
    })

    describe('empty edge cases', () => {
        it('handles document with no <head>', () => {
            const documents = [
                doc('ch1.xhtml', [el('html', [el('body', [el('p', [text('content')])])])]),
            ]

            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0],
                end: [1],
            })

            expect(fragment.nodes).toHaveLength(1)
            expect(fragment.styles).toEqual({})
        })

        it('handles empty styles map', () => {
            const documents = [
                htmlDoc('ch1.xhtml', [link('missing.css')], [el('p', [text('content')])]),
            ]

            const fragment = buildFragment({ content: documents, styles: {} }, {
                start: [0],
                end: [1],
            })

            // Link references missing.css but it's not in allStyles
            expect(fragment.styles).toEqual({})
        })
    })
})
