import AWS_S3, {
    S3Client,
    PutObjectCommand,
    GetObjectCommand, GetObjectCommandOutput,
    ListObjectsV2Command,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const IMAGES_BUCKET = 'booqs-images'

let _service: S3Client | undefined
function service() {
    if (!_service) {
        const s3 = new S3Client({
            region: 'us-east-1',
        })
        _service = s3
        return s3
    } else {
        return _service
    }
}

type AssetBody = Exclude<GetObjectCommandOutput['Body'], undefined>
async function bodyToBuffer(body: AssetBody): Promise<Buffer> {
    const array = await body.transformToByteArray()
    const buffer = Buffer.from(array)
    return buffer
}

export type Asset = AWS_S3._Object
export type AssetContent = Buffer
export async function downloadAsset(bucket: string, assetId: string): Promise<AssetContent | undefined> {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: assetId,
        })
        const result = await service().send(command)
        if (result.Body) {
            return bodyToBuffer(result.Body)
        } else {
            return undefined
        }
    } catch {
        return undefined
    }
}

export async function uploadAsset(bucket: string, assetId: string, body: AssetContent) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: assetId,
        Body: body,
    })
    return service().send(command)
}

export async function deleteAsset(bucket: string, assetId: string) {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: assetId,
    })
    return service().send(command)
}

export async function assetExists(bucket: string, assetId: string): Promise<boolean> {
    try {
        const command = new HeadObjectCommand({
            Bucket: bucket,
            Key: assetId,
        })
        await service().send(command)
        return true
    } catch (e: any) {
        if (e?.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
            return false
        } else {
            throw e
        }
    }
}

export async function deleteAssetsWithPrefix(bucket: string, prefix: string) {
    for await (const batch of listObjectBatches(bucket, prefix)) {
        if (batch.length === 0) continue
        const command = new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: batch.map(obj => ({ Key: obj.Key! })),
            },
        })
        await service().send(command)
    }
}

export async function* listObjects(bucket: string) {
    for await (const batch of listObjectBatches(bucket)) {
        yield* batch
    }
}

export async function generatePresignedUploadUrl(bucket: string, key: string, expiresInSeconds: number = 900) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
    })
    const url = await getSignedUrl(service(), command, { expiresIn: expiresInSeconds })
    return url
}

type ContinuationToken = string
async function* listObjectBatches(bucket: string, prefix?: string) {
    let objects: AWS_S3.ListObjectsV2CommandOutput
    let token: ContinuationToken | undefined = undefined
    do {
        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ContinuationToken: token,
        })
        objects = await service().send(command)
        token = objects.NextContinuationToken
        yield objects.Contents
            ? objects.Contents
            : []
    } while (objects.IsTruncated)
}