import { BooqPath, pathToString, BooqRange, pathToId, BooqId } from '@/core'

export function booqHref({ booqId, path }: {
    booqId: BooqId,
    path?: BooqPath,
}) {
    return path?.length
        ? `/booq/${booqId}/${pathToString(path)}#${pathToId(path)}`
        : `/booq/${booqId}`
}

export function quoteHref({ id, range }: {
    id: string,
    range: BooqRange,
}) {
    return `/booq/${id}/${pathToString(range.start)}/?start=${pathToString(range.start)}&end=${pathToString(range.end)}#${pathToId(range.start)}`
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

export function accountHref({ section }: { section?: 'profile' | 'followers' | 'collections' } = {}) {
    const defaultSection = 'profile'
    const targetSection = section || defaultSection
    return `/account/${targetSection}`
}

export function myBooqsHref() {
    return accountHref({ section: 'collections' })
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