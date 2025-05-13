/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs'
import path from 'path'
import type { CliOptions } from './main'
import { Diagnostic, openEpub } from 'booqs-epub'
import { validateEpub } from '@/parser/validate'
import { inspect } from 'util'
import { parseEpub } from '@/parser'
import { createZipFileProvider } from '@/parser/zip'

export async function parseEpubs(options: CliOptions) {
    console.info('Processing epub files...')
    const paths = options.commands
    const problems: Array<{
        path: string,
        diags: Diagnostic[],
    }> = []
    const CHUNK_SIZE = 1000
    let count = 0
    let chunk = 0
    const optionsString = Object.entries(options.switches).map(([key, value]) => `${key}=${value}`).join(' ')
    const timeKey = `parse: ${optionsString}`
    console.time(timeKey)
    console.time(`chunk ${chunk}`)
    for await (const path of allEpubFiles(paths)) {
        try {
            const { booq, epub, diags } = await processEpubFile(path, options)
            if ((++count) % CHUNK_SIZE === 0) {
                console.info(`Processed ${count} files`)
                console.timeEnd(`chunk ${chunk++}`)
                console.time(`chunk ${chunk}`)
            }
            if (options.switches['max']) {
                const max = parseInt(options.switches['max'])
                if (count >= max) {
                    console.info(`Reached max count of ${max} files`)
                    break
                }
            }
            if (options.switches['metadata'] === 'true') {
                console.info(`Metadata for ${path}: ${pretty(booq?.meta)}`)
                if (options.switches['raw'] === 'true') {
                    const rawMetadata = await epub.metadata()
                    console.info(`Raw metadata for ${path}: ${pretty(rawMetadata)}`)
                }
            }
            const filtered = filterDiags(diags, options)
            if (filtered.length > 0) {
                console.info(`Problems found in ${path}: ${pretty(filtered)}`)
                problems.push({
                    path,
                    diags: filtered,
                })
                if (options.switches['quick-fail'] === 'true') {
                    break
                }
            }
            if (options.switches['one'] === 'true') {
                break
            }
        } catch (err) {
            console.error(`Error processing file ${path}: ${err}`)
            problems.push({
                path,
                diags: [
                    {
                        message: `Error processing file`,
                        data: err,
                        severity: 'error',
                    },
                ],
            })
        }
    }
    if (problems.length > 0) {
        console.info(`Found ${problems.length} problems in ${count} files`)
        for (const { path, diags } of problems) {
            console.info(`Problems in ${path}: ${pretty(diags)}`)
        }
    } else {
        console.info(`No problems found in ${count} files`)
    }
    console.timeEnd(`chunk ${chunk}`)
    console.timeEnd(timeKey)
}

async function processEpubFile(filePath: string, options: CliOptions) {
    const diags: Diagnostic[] = []
    const fileBuffer = await fs.promises.readFile(filePath)
    const epub = openEpub(createZipFileProvider(fileBuffer), diags)
    const { value: booq } = await parseEpub({
        epub, diags,
    })
    if (!booq) {
        diags?.push({
            message: `Can't parse file`,
            severity: 'critical',
        })
    }
    if (options.switches['validate'] === 'true') {
        await validateEpub({
            epub, diags,
        })
    }
    return {
        booq, epub, diags,
    }
}

function filterDiags(diags: Diagnostic[], options: CliOptions): Diagnostic[] {
    return diags.filter(diag => {
        return diag.severity !== 'info'
        // && !diag.message?.startsWith('Missing attribute #text')
        // && !diag.message?.startsWith('Multiple titles found in metadata')
    })
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