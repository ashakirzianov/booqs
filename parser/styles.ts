import { BooqDocument, BooqStyles, BooqChildNode } from '../core'
import { Epub } from './epub'
import { resolveHref } from './href'
import { processCss } from './css'
import { Diagnoser } from 'booqs-epub'

export async function processStyles(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<BooqStyles> {
    const styles: BooqStyles = {}
    for (const doc of documents) {
        const styleRefs: string[] = []
        const head = findHead(doc)
        if (head) {
            for (const child of head.children) {
                if (typeof child === 'string' || child === null || !child.name) continue
                if (child.name === 'link') {
                    const key = await processLinkElement(child, doc.fileName, styles, epub, diags)
                    if (key) styleRefs.push(key)
                } else if (child.name === 'style') {
                    const key = processStyleElement(child, doc.fileName, styles, diags)
                    if (key) styleRefs.push(key)
                }
            }
        }
        if (styleRefs.length > 0) {
            doc.styleRefs = styleRefs
        }
    }
    return styles
}

function findHead(doc: BooqDocument): { children: BooqChildNode[] } | undefined {
    for (const child of doc.children) {
        if (typeof child === 'string' || child === null) continue
        if (child.name === 'html') {
            for (const htmlChild of child.children) {
                if (typeof htmlChild === 'string' || htmlChild === null) continue
                if (htmlChild.name === 'head') return htmlChild
            }
        }
        if (child.name === 'head') return child
    }
    return undefined
}

async function processLinkElement(
    link: { attributes?: Record<string, string | undefined> },
    fileName: string,
    styles: BooqStyles,
    epub: Epub,
    diags: Diagnoser,
): Promise<string | undefined> {
    const rel = link.attributes?.rel
    if (rel?.toLowerCase() !== 'stylesheet') return undefined

    const href = link.attributes?.href
    if (!href) {
        diags.push({ message: 'missing href on stylesheet link' })
        return undefined
    }

    const resolved = resolveHref(href, fileName)
    if (!resolved) return undefined
    const key = generateSelectorPrefix(`ref-${resolved.fileName}`)
    if (!(key in styles)) {
        const content = await epub.loadTextFile(resolved.fileName)
        if (!content) {
            diags.push({ message: `couldn't load css: ${href}` })
            return undefined
        }
        styles[key] = processCss(content, { prefix: key })
    }
    return key
}

function processStyleElement(
    style: { children: BooqChildNode[] },
    fileName: string,
    styles: BooqStyles,
    diags: Diagnoser,
): string | undefined {
    const text = typeof style.children[0] === 'string' ? style.children[0] : undefined
    if (!text) {
        diags.push({ message: `empty or missing text in <style> element in ${fileName}` })
        return undefined
    }
    const key = generateSelectorPrefix(`inline-${fileName}`)
    if (key in styles) {
        styles[key] += '\n' + processCss(text, { prefix: key })
    } else {
        styles[key] = processCss(text, { prefix: key })
    }
    return key
}

function generateSelectorPrefix(id: string) {
    return `booqs-${id.replace(/[^a-zA-Z0-9]/g, '-')}`
}
