export function pageForPosition(position: number): number {
    return Math.ceil(position / 2500)
}

export function currentSource(): string {
    return 'default/0'
}

export function colorSchemeForBaseColor(baseColor: string) {
    return {
        backgroundColor: `hsl(from ${baseColor} h s calc(l - 5) / 90%)`,
        // backgroundColor: baseColor,
        selectionColor: `hsl(from ${baseColor} h calc(s - 25) calc(l - 25) / 100%)`,
        textColor: 'var(--color-light)',
        // textColor: '#eee',
        dimmedColor: `hsl(from ${baseColor} h calc(s - 30) 95%)`,
    }
}

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
