import { BooqId } from '@/core'
import { uploadAsset } from './blob'

const CACHE_BUCKET = 'booqs-cache'

export async function storeDiagnostics(booqId: BooqId, diags: unknown[]): Promise<void> {
    if (diags.length === 0) return
    const json = JSON.stringify(diags)
    await uploadAsset(CACHE_BUCKET, `booqs/${booqId}.diags.json`, Buffer.from(json, 'utf-8'))
}
