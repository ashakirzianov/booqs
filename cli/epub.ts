/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'fs'
import path from 'path'
import type { CliOptions } from './main'
import { Diagnostic, flattenDiags, openEpub } from 'booqs-epub'
import { validateEpub, validateEpubFile } from '@/parser/validator'
import { inspect } from 'util'
import { extractMetadata, extractMetadataFromEpub } from '@/parser'
import { createZipFileProvider } from '@/parser/zip'

export async function processEpubs(options: CliOptions) {
    console.info('Processing epub files...')
    const paths = options.commands
    const problems: Array<{
        path: string,
        diags: Diagnostic[],
    }> = []
    let count = 0
    for await (const path of allEpubFiles(paths)) {
        try {
            const result = await processEpubFile(path, options)
            if ((++count) % 1000 === 0) {
                console.info(`Processed ${count} files`)
            }
            if (result.length > 0) {
                console.info(`Problems found in ${path}`)
                problems.push({
                    path,
                    diags: result,
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
        console.info(`Found ${problems.length} problems`)
        for (const { path, diags } of problems) {
            console.info(`Problems in ${path}: ${pretty(diags)}`)
        }
    } else {
        console.info('No problems found')
    }
}

async function processEpubFile(filePath: string, options: CliOptions): Promise<Diagnostic[]> {
    const fileBuffer = await fs.promises.readFile(filePath)
    const diagnoser: Diagnostic[] = []
    const epub = openEpub(createZipFileProvider(fileBuffer), diagnoser)
    if (options.switches['validate'] === 'true') {
        const result = await validateEpubFile({
            epub, diags: diagnoser,
        })
        return filterDiags(result.diags)
    } else {
        const epubMeta = await epub.metadata()
        if (epubMeta) {
            const { value, diags } = await extractMetadataFromEpub({
                epub, diags: diagnoser,
            })
            if (value) {
                const { metadata } = value
                const filtered = filterDiags(diags)
                if (filtered.length > 0) {
                    if (options.switches['raw'] === 'true') {
                        console.info(`Raw metadata for ${filePath}: ${pretty(epubMeta)}`)
                    }
                    console.info(`Metadata for ${filePath}: ${pretty(metadata)}`)
                }
                return filtered
            }
        }
        diagnoser.push(`Can't get metadata for ${filePath}`)
        return filterDiags(diagnoser)
    }
}

function filterDiags(diags: Diagnostic[]): Diagnostic[] {
    return flattenDiags(diags).filter(diag => {
        return diag.severity !== 'info'
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