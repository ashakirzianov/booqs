import { createHash } from 'crypto';
import { createReadStream, readFile } from 'fs';
import { uuCards, uuRegistry, DbUpload, DbUuCard, userUploadedEpubsBucket } from './schema';
import { promisify, inspect } from 'util';
import { parseEpub } from '../../parser';
import { booqLength, Booq } from '../../core';
import { uploadAsset } from '../s3';
import { uuid } from '../utils';
import { uploadImages } from '../images';

export async function uploadEpub(filePath: string, userId: string) {
    const fileHash = await buildFileHash(filePath);
    const existing = await uuCards.findOne({ fileHash }).exec();
    if (existing) {
        return addToRegistry(existing._id, userId);
    }

    const file = await promisify(readFile)(filePath);
    const booq = await parseEpub({
        fileData: file,
        diagnoser: diag => report(diag.diag, diag.data),
    });
    if (!booq) {
        report(`Can't parse upload`);
        return;
    }
    const assetId = uuid();
    const uploadResult = await uploadAsset(userUploadedEpubsBucket, assetId, file);
    if (!uploadResult.$response) {
        report(`Can't upload file to S3`);
        return;
    }
    const insertResult = await insertRecord(booq, assetId, fileHash);
    const uploadImagesResult = await uploadImages(insertResult._id, booq);
    return insertResult;
}

async function insertRecord(booq: Booq, assetId: string, fileHash: string, ) {
    const {
        title, creator: author, subject, language, description, cover,
        ...rest
    } = booq.meta;
    const subjects = typeof subject === 'string' ? [subject]
        : Array.isArray(subject) ? subject
            : [];
    const length = booqLength(booq);
    const doc: DbUuCard = {
        assetId,
        length,
        fileHash,
        subjects,
        title: parseString(title),
        author: parseString(author),
        language: parseString(language),
        description: parseString(description),
        cover: parseString(cover),
        meta: rest,
    };
    const [inserted] = await uuCards.insertMany([doc]);
    report('inserted', inserted);
    return inserted;
}

async function addToRegistry(cardId: string, userId: string) {
    const doc: DbUpload = {
        userId,
        cardId,
    };
    const [result] = await uuRegistry.insertMany([doc]);
    return result;
}

async function buildFileHash(filePath: string) {
    return new Promise<string>((resolve, reject) => {
        try {
            const hash = createHash('md5');
            const stream = createReadStream(filePath);

            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('base64')));
        } catch (e) {
            reject(e);
        }
    });
}

function parseString(field: unknown) {
    return typeof field === 'string'
        ? field : undefined;
}

function report(label: string, data?: any) {
    console.log('UU: \x1b[32m%s\x1b[0m', label);
    if (data) {
        console.log(inspect(data, false, 3, true));
    }
}
