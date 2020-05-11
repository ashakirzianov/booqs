import { typedModel, TypeFromSchema, taggedObject } from '../mongoose';

const schema = {
    assetId: {
        type: String,
        required: true,
    },
    index: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    length: {
        type: Number,
        required: true,
    },
    title: String,
    author: String,
    language: String,
    description: String,
    subjects: [String],
    cover: String,
    meta: taggedObject<object>(),
} as const;

export type DbPgCard = TypeFromSchema<typeof schema>;
export const pgCards = typedModel('pg-cards', schema);

export const epubsBucket = 'pg-epubs';
