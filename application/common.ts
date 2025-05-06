export function pageForPosition(position: number): number {
    return Math.ceil(position / 2500)
}

export function currentSource(): string {
    return 'default/0'
}

const defaultColor = 'rgba(255, 215, 0, 0.6)'
const noteColorMapping: {
    [color in string]: string | undefined;
} = {
    first: defaultColor,
    second: 'rgba(135, 206, 235, 0.6)',
    third: 'rgba(240, 128, 128, 0.6)',
    forth: 'rgba(75, 0, 130, 0.6)',
    fifth: 'rgba(34, 139, 34, 0.6)',
}
export function resolveNoteColor(color: string) {
    return noteColorMapping[color] ?? defaultColor
}
export const quoteColor = 'rgba(255, 165, 0, 0.6)'
export const noteColorNames = Object.keys(noteColorMapping)
