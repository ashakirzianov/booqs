import { inspect } from 'util'
import { makeBatches } from './utils'
import { Asset, downloadAsset, listObjects } from './s3'
import {
    existingAssetIds, pgEpubsBucket, insertAssetRecord,
} from './pg'
import { parseEpub } from '@/parser'
import { uploadBooqImages } from './images'
import { redis } from './db'

export type SyncWorkerProps = {
    batchSize: number
}
export async function pgSyncWorker(props: SyncWorkerProps) {
    let count = 0
    for await (const { id, booq } of syncS3ToCards(props)) {
        count++
        uploadBooqImages(`pg/${id}`, booq)
    }
    return count
}

async function* syncS3ToCards({ batchSize }: SyncWorkerProps) {
    report('Syncing with S3')

    const batches = makeBatches(assetsToProcess(), batchSize)
    for await (const batch of batches) {
        const added = await Promise.all(
            batch.map(processAsset),
        )
        yield* added.filter(result => result !== undefined)
    }

    report('done syncing with S3')
}

async function* assetsToProcess() {
    const existing = await existingAssetIds()
    for await (const asset of listEpubObjects()) {
        if (!asset.Key) {
            report('bad asset', asset)
            continue
        } if (existing.some(id => id === asset.Key)) {
            continue
        } else if (await hasProblems(asset.Key)) {
            report('skipping asset with problems', asset.Key)
            continue
        }
        yield asset
    }
}

async function processAsset(asset: Asset) {
    if (!asset.Key) {
        report('bad asset', asset)
        return
    }
    try {
        const result = await downloadAndInsert(asset.Key)
        return result
    } catch (e) {
        report(`Promise rejection ${asset.Key}: ${e}`)
        reportProblem(asset.Key, 'Unhandled exception', e)
        return
    }
}

async function hasProblems(assetId: string) {
    return redis.hexists('pg:problems', assetId)
}

async function reportProblem(assetId: string, message: string, err: any) {
    return redis.hset('pg:problems', {
        [assetId]: {
            message, err,
        },
    })
}

async function* listEpubObjects() {
    yield* listObjects(pgEpubsBucket)
}

async function downloadAndInsert(assetId: string) {
    report(`Processing ${assetId}`)
    const asset = await downloadAsset(pgEpubsBucket, assetId)
    if (!asset) {
        report(`Couldn't load pg asset: ${assetId}`)
        return
    }
    const { value: booq, diags } = await parseEpub({
        fileData: asset as any,
    })
    if (!booq) {
        report(`Couldn't parse epub: ${assetId}`)
        await reportProblem(assetId, 'Parsing errors', diags)
        return
    }
    const { id } = await insertAssetRecord({ booq, assetId }) ?? {}
    if (id) {
        return {
            id,
            booq,
        }
    } else {
        return undefined
    }
}

function report(label: string, data?: any) {
    console.info('PG: \x1b[32m%s\x1b[0m', label)
    if (data) {
        console.info(inspect(data, false, 3, true))
    }
}