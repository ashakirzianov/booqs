import { BooqDocument, BooqStyles, BooqChildNode, isElementNode, mapChildNodesAsync } from '../core'
import { Epub } from './epub'
import { resolveHref } from './href'
import postcss, { Plugin } from 'postcss'
import { Diagnoser } from 'booqs-epub'

export type ProcessStylesResult = {
    documents: BooqDocument[],
    styles: BooqStyles,
}

export async function processStyles(documents: BooqDocument[], epub: Epub, diags: Diagnoser): Promise<ProcessStylesResult> {
    const styles: BooqStyles = {}
    const transformed = await Promise.all(documents.map(async doc => ({
        ...doc,
        children: await mapChildNodesAsync(doc.children, node => transformStyleNode(node, doc.fileName, styles, epub, diags)),
    })))
    return { documents: transformed, styles }
}

async function transformStyleNode(node: BooqChildNode, docFileName: string, styles: BooqStyles, epub: Epub, diags: Diagnoser): Promise<BooqChildNode> {
    if (!isElementNode(node)) return node

    if (node.name === 'link') {
        return transformLinkElement(node, docFileName, styles, epub, diags)
    }
    if (node.name === 'style') {
        return transformStyleElement(node, docFileName, diags)
    }
    return node
}

async function transformLinkElement(
    link: BooqChildNode & { name: string },
    docFileName: string,
    styles: BooqStyles,
    epub: Epub,
    diags: Diagnoser,
): Promise<BooqChildNode> {
    const rel = link.attributes?.rel
    if (rel?.toLowerCase() !== 'stylesheet') return link

    const href = link.attributes?.href
    if (!href) {
        diags.push({ message: 'missing href on stylesheet link' })
        return link
    }

    const resolved = resolveHref(href, docFileName)
    if (!resolved) return link
    const canonicalFileName = resolved.fileName

    if (!(canonicalFileName in styles)) {
        const content = await epub.loadTextFile(canonicalFileName)
        if (!content) {
            diags.push({ message: `couldn't load css: ${href}` })
            return link
        }
        styles[canonicalFileName] = processCss(content)
    }

    return { ...link, attributes: { ...link.attributes, href: canonicalFileName } }
}

function transformStyleElement(
    style: BooqChildNode & { name: string; children: BooqChildNode[] },
    docFileName: string,
    diags: Diagnoser,
): BooqChildNode {
    const text = typeof style.children[0] === 'string' ? style.children[0] : undefined
    if (!text) {
        diags.push({ message: `empty or missing text in <style> element in ${docFileName}` })
        return style
    }
    if (style.children.length > 1) {
        diags.push({ message: `<style> element with multiple children in ${docFileName} - only the first child will be processed` })
    }
    return { ...style, children: [processCss(text)] }
}

// --- CSS processing ---

function processCss(cssString: string) {
    return postcss()
        .use(rewriteColorsPlugin())
        .use(rewriteRootSelectorsPlugin())
        .process(cssString).css
}

function rewriteRootSelectorsPlugin(): Plugin {
    const rootSelectors = ['html', 'body', ':root']
    return {
        postcssPlugin: 'rewrite-root-selectors',
        Rule(rule) {
            if (!rule.selectors) return
            rule.selectors = rule.selectors.map(selector => {
                for (const root of rootSelectors) {
                    if (selector === root) return ':scope'
                    if (selector.startsWith(root + ' ')) {
                        return ':scope' + selector.slice(root.length)
                    }
                }
                return selector
            })
        },
    }
}

const globalSelectorRoots = ['*', 'html', 'body', ':root', ':scope']

function isGlobalSelector(selector: string): boolean {
    const trimmed = selector.trim()
    return globalSelectorRoots.some(root =>
        trimmed === root || trimmed.startsWith(root + ' ') ||
        trimmed.startsWith(root + '.') || trimmed.startsWith(root + '[') ||
        trimmed.startsWith(root + ':') || trimmed.startsWith(root + '#'),
    )
}

function rewriteColorsPlugin(): Plugin {
    return {
        postcssPlugin: 'rewrite-colors-for-dark-theme',
        Declaration(decl) {
            if (!['background', 'background-color', 'color'].includes(decl.prop)) {
                return
            }
            const parent = decl.parent
            if (parent?.type === 'rule') {
                // postcss Rule type — safe to access selectors
                const rule = parent as postcss.Rule
                if (rule.selectors?.some(isGlobalSelector)) {
                    decl.remove()
                }
            }
        },
    }
}
