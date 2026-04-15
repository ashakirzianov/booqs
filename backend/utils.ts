export async function logTimeAsync<T>(label: string, f: () => Promise<T>) {
    console.time(label)
    const result = await f()
    console.timeEnd(label)
    return result
}

export function logTime<T>(label: string, f: () => T) {
    console.time(label)
    const result = f()
    console.timeEnd(label)
    return result
}

export async function* makeBatches<T>(generator: AsyncGenerator<T>, size: number) {
    let batch: T[] = []
    for await (const item of generator) {
        if (batch.length < size) {
            batch.push(item)
        } else {
            yield batch
            batch = [item]
        }
    }
    if (batch.length > 0) {
        yield batch
    }
}