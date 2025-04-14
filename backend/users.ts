import { BooqPath, filterUndefined } from '@/core'
import { typedModel, TypeFromSchema, taggedObject } from './mongoose'
import slugify from 'slugify'
import { afterPrefix } from './utils'
import { uniq } from 'lodash'

export async function userForId(id: string) {
    return (await collection).findById(id).exec()
}

export async function createUser(user: Omit<DbUser, '_id' | 'username' | 'joined'>) {
    const username = await proposeUsername(user)
    const toAdd: Omit<DbUser, '_id'> = {
        ...user,
        username,
        joined: new Date(),
    }
    const [insertResult] = await (await collection).insertMany([toAdd])
    return insertResult
}

export type DbCollection = string[]
export function userCollection(user: DbUser, name: string): DbCollection {
    switch (name) {
        case 'my-books':
            return combineCollections([
                namedCollection(user, 'my-books'),
                namedCollection(user, 'uploads'),
            ])
        default:
            return namedCollection(user, name)
    }
}

function namedCollection(user: DbUser, name: string): DbCollection {
    const result = filterUndefined(
        user.collections?.map(c => afterPrefix(c, `${name}:`)) ?? [],
    )
    return result
}

function combineCollections(collections: DbCollection[]): DbCollection {
    const all = collections.reduce((res, curr) => res.concat(curr))
    const result = uniq(all)
    return result
}

export async function addToCollection(
    userId: string,
    name: string,
    booqId: string,
) {
    const result = await (await collection).findByIdAndUpdate(
        userId,
        {
            $addToSet: {
                collections: `${name}:${booqId}`,
            },
        },
    )
    return result ? true : false
}

export async function removeFromCollection(
    userId: string,
    name: string,
    booqId: string,
) {
    const result = await (await collection).findByIdAndUpdate(
        userId,
        {
            $pull: {
                collections: `${name}:${booqId}`,
            },
        },
    )
    return result ? true : false
}

export async function addUpload(userId: string, uploadId: string) {
    return addToCollection(userId, 'uploads', `uu/${uploadId}`)
}


type UserDataForNameGeneration = {
    name?: string,
    email?: string,
}
async function proposeUsername(user: UserDataForNameGeneration) {
    const base = generateUsername(user)
    let current = base
    let next = current
    let idx = await (await collection).estimatedDocumentCount()
    let existing: any
    do {
        current = next
        existing = await (await collection)
            .findOne({ username: current })
            .exec()
        next = `${base}${++idx}`
    } while (existing)
    return current
}

function generateUsername({ name, email }: UserDataForNameGeneration) {
    const base = name ?? email ?? 'user'
    const username = slugify(base, {
        replacement: '.',
        lower: true,
        strict: true,
        locale: 'en',
    })
    return username
}

const schema = {
    joined: {
        type: Date,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    name: String,
    facebookId: String,
    appleId: String,
    pictureUrl: String,
    email: String,
    bookmarks: taggedObject<StringMap<BookmarkData>>(),
    history: taggedObject<StringMap<StringMap<BooqHistoryData>>>(),
    collections: [String],
} as const
const collection = typedModel('users', schema)

type DbUser = TypeFromSchema<typeof schema>

type StringMap<T> = {
    [k: string]: T,
}
type BookmarkData = {
    booqId: string,
    path: BooqPath,
}
type BooqHistoryData = {
    path: BooqPath,
    date: Date,
}

export type DbBooqHistory = BooqHistoryData & {
    booqId: string,
    source: string,
}
export function userBooqHistory(user: DbUser): DbBooqHistory[] {
    const results = Object.entries(user.history ?? {}).map(
        ([booqId, sourceData]) => Object.entries(sourceData).map(([source, data]) => ({
            booqId, source,
            ...data,
        })),
    )
    const flat = results.flat()
    const sorted = flat.sort((a, b) => b.date.valueOf() - a.date.valueOf())
    return sorted
}

export async function addBooqHistory(
    userId: string,
    { booqId, source, ...data }: DbBooqHistory,
) {
    const result = await (await collection).findByIdAndUpdate(
        userId,
        {
            [`history.${booqId}.${source}`]: data,
        },
    ).exec()

    return result ? true : false
}

export async function deleteBooqHistory(
    userId: string,
    { booqId }: Pick<DbBooqHistory, 'booqId'>,
) {
    const result = await (await collection).findByIdAndUpdate(
        userId,
        {
            $unset: {
                [`history.${booqId}`]: '',
            },
        },
    ).exec()

    return result ? true : false
}

