import { inspect } from 'util';
import { flatten, uniq } from 'lodash';
import { BooqMeta } from '../core';
import { parseEpub } from '../parser';
import { pgCards, DbPgCard, epubsBucket } from './gutenberg/schema';
import { makeBatches } from './utils';
import { listObjects, downloadAsset, Asset } from './s3';
import { uploadImages } from './images';

export async function syncWithS3() {
    report('Syncing with S3');

    const batches = makeBatches(listEpubObjects(), 50);
    for await (const batch of batches) {
        await Promise.all(
            batch.map(processAsset),
        );
    }

    report('done syncing with S3');
}

async function processAsset(asset: Asset) {
    if (!asset.Key) {
        report('bad asset', asset);
        return;
    } else if (await recordExists(asset.Key)) {
        report(`Skipping ${asset.Key}`);
        return;
    }
    return downloadAndInsert(asset.Key);
}

async function recordExists(assetId: string) {
    return pgCards.exists({ assetId });
}

async function* listEpubObjects() {
    yield* listObjects(epubsBucket);
}

async function downloadAndInsert(assetId: string) {
    report(`Processing ${assetId}`);
    const asset = await downloadAsset(epubsBucket, assetId);
    if (!asset) {
        report(`Couldn't load pg asset: ${asset}`);
        return;
    }
    const booq = await parseEpub({
        fileData: asset as any,
        diagnoser: diag => {
            report(diag.diag, diag.data);
        },
    });
    if (!booq) {
        report(`Couldn't parse epub: ${assetId}`);
        return;
    }
    const document = await insertRecord(booq.meta, assetId);
    if (document) {
        const booqId = `pg/${document.index}`;
        await uploadImages(booqId, booq);
        return booqId;
    } else {
        return undefined;
    }
}

async function insertRecord(metadata: BooqMeta, assetId: string) {
    const index = indexFromAssetId(assetId);
    if (index === undefined) {
        report(`Invalid asset ig: ${assetId}`);
        return undefined;
    }
    const {
        title, creator: author, subject, language, description,
        ...rest
    } = metadata;
    const doc: DbPgCard = {
        assetId,
        index,
        title: parseString(title),
        author: parseString(author),
        language: parseString(language),
        description: parseString(description),
        subjects: parseSubject(subject),
        meta: rest,
    };
    const [inserted] = await pgCards.insertMany([doc]);
    report('inserted', inserted);
    return inserted;
}

function parseString(field: unknown) {
    return typeof field === 'string'
        ? field : undefined;
}

function parseSubject(subject: unknown) {
    if (Array.isArray(subject)) {
        const subs = subject.map((s: string) => s.split(' -- '));
        const result = uniq(flatten(subs));
        return result;
    } else if (typeof subject === 'string') {
        return [subject];
    } else {
        return undefined;
    }
}

function indexFromAssetId(assetId: string) {
    const match = assetId.match(/^pg(\d+)/);
    if (match) {
        const indexString = match[1];
        const index = parseInt(indexString, 10);
        return isNaN(index) ? undefined : indexString;
    } else {
        return undefined;
    }
}

function report(label: string, data?: any) {
    console.log('PG: \x1b[32m%s\x1b[0m', label);
    if (data) {
        console.log(inspect(data, false, 3, true));
    }
}
