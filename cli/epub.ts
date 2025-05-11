import fs from 'fs'
import path from 'path'
import type { CliOptions } from './main'
import { Diagnostic } from 'booqs-epub'
import { validateEpub } from '@/parser/validator'
import { inspect } from 'util'

export async function processEpubs(options: CliOptions) {
    console.info('Processing epub files...')
    const paths = options.commands
    const batchSize = parseInt(options.switches['batch'] ?? '1')
    console.info(`Batch size: ${batchSize}`)
    const problems: Array<{
        path: string,
        diags: Diagnostic[],
    }> = []
    let count = 0
    try {
        for await (const files of makeBatches(allEpubFiles(paths), batchSize)) {
            const promises = files
                .map(
                    file => processEpubFile(file, options)
                        .then(diags => {
                            if ((++count) % 100 === 0) {
                                console.info(`Processed ${count} files`)
                            }
                            if (diags.length > 0) {
                                problems.push({ path: file, diags })
                                console.error(`File ${file} has problems: ${pretty(diags)}`)
                                if (options.switches['quick-fail'] === 'true') {
                                    throw 'quick-fail'
                                }
                            }
                        })
                        .catch(err => {
                            if (err === 'quick-fail') {
                                throw err
                            }
                            console.error(`Error processing file ${file}: ${err}`)
                            problems.push({ path: file, diags: [{ message: err.message, severity: 'error' }] })
                        })
                )
            await Promise.all(promises)
        }
    } catch (err) {
        if (err !== 'quick-fail') {
            console.error('Error processing epub files:', err)
        }
    } finally {
        if (problems.length > 0) {
            console.error(`Found ${problems.length} files with problems`)
            console.info(problems.map(p => p.path).join('\n'))
        } else {
            console.info('All files processed successfully')
        }
    }
}

async function processEpubFile(filePath: string, _options: CliOptions): Promise<Diagnostic[]> {
    const fileBuffer = await fs.promises.readFile(filePath)
    const { diags } = await validateEpub({
        fileBuffer,
    })
    return diags.flat(10).filter(diag => (diag as any)?.severity !== 'info')
}

async function* allEpubFiles(paths: string[]): AsyncGenerator<string> {
    const set = new Set<string>()
    for (const dir of paths) {
        for await (const file of allEpubFilesAtPath(dir)) {
            if (!set.has(file)) {
                set.add(file)
                yield file
            }
        }
    }
}

async function* allEpubFilesAtPath(directoryPath: string): AsyncGenerator<string> {
    const stat = await fs.promises.stat(directoryPath)
    if (stat.isDirectory()) {
        const files: string[] = await fs.promises.readdir(directoryPath)
        for (const file of files) {
            const filePath = path.join(directoryPath, file)
            yield* allEpubFilesAtPath(filePath)
        }
    } else if (path.extname(directoryPath) === '.epub') {
        yield directoryPath
    }
}

async function* makeBatches<T>(items: AsyncGenerator<T>, batchSize: number): AsyncGenerator<T[]> {
    let batch: T[] = []
    for await (const item of items) {
        batch.push(item)
        if (batch.length >= batchSize) {
            yield batch
            batch = []
        }
    }
    if (batch.length > 0) {
        yield batch
    }
}

function pretty(obj: any): string {
    return inspect(obj, false, null, true)
}