import { BooqPath, pathToString, BooqRange, pathToId, BooqId, rangeToString } from '@/core'

export function booqHref({ booqId, path }: {
    booqId: BooqId,
    path?: BooqPath,
}) {
    return path?.length
        ? `/booq/${booqId}/content?path=${pathToString(path)}#${pathToId(path)}`
        : `/booq/${booqId}/content`
}

export function quoteHref({ booqId, range }: {
    booqId: BooqId,
    range: BooqRange,
}) {
    return `/booq/${booqId}/content?quote=${rangeToString(range)}#${pathToId(range.start)}`
}

export function feedHref() {
    return '/'
}

export function searchHref({ query }: {
    query: string,
}) {
    return `/search?query=${encodeURIComponent(query)}`
}

export function authHref({ returnTo }: {
    returnTo?: string,
}) {
    return `/auth${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ''}`
}

export function signInLinkHref({ email, secret, returnTo }: {
    email: string,
    secret: string,
    returnTo?: string,
}) {
    const params = new URLSearchParams({
        email,
        secret,
    })
    if (returnTo) {
        params.set('return_to', returnTo)
    }
    return `/auth/signin?${params.toString()}`
}

export function signInErrorHref({ error, returnTo }: {
    error: string,
    returnTo: string,
}) {
    const params = new URLSearchParams({
        error,
        return_to: returnTo,
    })
    return `/auth/signin/error?${params.toString()}`
}

export function signUpLinkHref({ email, secret, returnTo }: {
    email: string,
    secret: string,
    returnTo?: string,
}) {
    const params = new URLSearchParams({
        email,
        secret,
    })
    if (returnTo) {
        params.set('return_to', returnTo)
    }
    return `/auth/signup?${params.toString()}`
}

export function profileHref() {
    return '/profile'
}

export function collectionsHref() {
    return '/collections'
}

export function followersHref() {
    return '/followers'
}

export function historyHref() {
    return '/history'
}

export function notesHref() {
    return '/notes'
}

export function myBooqsHref() {
    return collectionsHref()
}

// Legacy function - deprecated, use specific href functions instead
export function accountHref({ section }: { section?: 'profile' | 'followers' | 'collections' } = {}) {
    const defaultSection = 'profile'
    const targetSection = section || defaultSection
    switch (targetSection) {
        case 'profile': return profileHref()
        case 'followers': return followersHref()
        case 'collections': return collectionsHref()
        default: return profileHref()
    }
}

export function authorHref({ name, libraryId }: { name: string, libraryId: string }) {
    return `/library/${libraryId}/author/${encodeURIComponent(name)}`
}

export function subjectHref({ subject, libraryId }: { subject: string, libraryId: string }) {
    return `/library/${libraryId}/subject/${encodeURIComponent(subject)}`
}

export function languageHref({ language, libraryId }: { language: string, libraryId: string }) {
    return `/library/${libraryId}/language/${encodeURIComponent(language)}`
}

export function userHref({ username }: { username: string }) {
    return `/users/${username}`
}