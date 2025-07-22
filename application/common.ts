export function pageForPosition(position: number): number {
    return Math.ceil(position / 2500)
}

export function currentSource(): string {
    return 'default/0'
}

const noteKindToColorSchemeMapping: {
    [kind in string]: {
        color: string,
        textColor: string,
        dimmedColor: string
    } | undefined
} = {
    first: {
        color: 'rgba(255, 215, 0, 0.6)',
        textColor: 'rgb(184, 134, 11)',
        dimmedColor: 'rgba(184, 134, 11, 0.7)'
    },
    second: {
        color: 'rgba(135, 206, 235, 0.6)',
        textColor: 'rgb(30, 64, 175)',
        dimmedColor: 'rgba(30, 64, 175, 0.7)'
    },
    third: {
        color: 'rgba(240, 128, 128, 0.6)',
        textColor: 'rgb(185, 28, 28)',
        dimmedColor: 'rgba(185, 28, 28, 0.7)'
    },
    forth: {
        color: 'rgba(75, 0, 130, 0.6)',
        textColor: 'rgb(55, 6, 91)',
        dimmedColor: 'rgba(55, 6, 91, 0.7)'
    },
    fifth: {
        color: 'rgba(34, 139, 34, 0.6)',
        textColor: 'rgb(22, 101, 52)',
        dimmedColor: 'rgba(22, 101, 52, 0.7)'
    }
}

export function highlightColorForNoteKind(kind: string) {
    return noteKindToColorSchemeMapping[kind]?.color ?? 'var(--color-background)'
}

export function textColorForNoteKind(kind: string) {
    return noteKindToColorSchemeMapping[kind]?.textColor ?? 'var(--color-primary)'
}

export function dimmedColorForNoteKind(kind: string) {
    return noteKindToColorSchemeMapping[kind]?.dimmedColor ?? 'var(--color-dimmed)'
}
export const quoteColor = 'rgba(255, 165, 0, 0.6)'
export const temporaryColor = 'rgba(180, 213, 255, 0.99)'
export const noteColoredKinds = Object.keys(noteKindToColorSchemeMapping)

function formatDateString(date: Date, currentDate: Date): string {
    const isSameYear = date.getFullYear() === currentDate.getFullYear()

    if (isSameYear) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }
}

export function formatRelativeTime(date: Date, currentDate: Date = new Date()): string {
    const diffMs = currentDate.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    // If more than 7 days, show date
    if (diffDays > 7) {
        return formatDateString(date, currentDate)
    }

    // Relative time formatting
    if (diffSeconds < 60) {
        return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
}
