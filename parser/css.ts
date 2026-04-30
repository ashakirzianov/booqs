import postcss, { Plugin } from 'postcss'

export function processCss(cssString: string) {
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
