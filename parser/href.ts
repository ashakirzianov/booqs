export type ResolvedHref = {
    fileName: string,
    id?: string,
}

// Resolves an EPUB-internal href relative to a base file path.
// Returns undefined for external links.
export function resolveHref(href: string, baseFileName: string): ResolvedHref | undefined {
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        return undefined
    }

    const hashIndex = href.indexOf('#')
    if (hashIndex === 0) {
        // Same-file reference: "#id"
        return { fileName: baseFileName, id: href.substring(1) }
    }

    const filePart = hashIndex > 0 ? href.substring(0, hashIndex) : href
    const id = hashIndex > 0 ? href.substring(hashIndex + 1) : undefined
    const resolved = resolvePath(filePart, baseFileName)
    return { fileName: resolved, id }
}

// Produces the canonical map key for a resolved href: "fileName#id" or "fileName".
export function hrefToKey(resolved: ResolvedHref): string {
    return resolved.id
        ? `${resolved.fileName}#${resolved.id}`
        : resolved.fileName
}

// Resolves a relative file path against a base file path.
// Handles ../ traversal at any depth.
function resolvePath(path: string, baseFileName: string): string {
    if (!path.includes('/') && !baseFileName.includes('/')) {
        // Both are bare filenames in the same directory
        return path
    }
    const baseParts = baseFileName.split('/')
    baseParts.pop() // remove the base filename, keep directory
    const pathParts = path.split('/')
    for (const part of pathParts) {
        if (part === '..') {
            baseParts.pop()
        } else if (part !== '.') {
            baseParts.push(part)
        }
    }
    return baseParts.join('/')
}
