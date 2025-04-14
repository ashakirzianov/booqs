import { BooqPath } from '@/core'
import { typedModel, TypeFromSchema, taggedObject } from './mongoose'
import slugify from 'slugify'
export const users = {
    forId, createUser,
    // forEmail,
    // updateOrCreateForAppleUser, updateOrCreateForFacebookUser,
    // userBookmarks, addBookmark, deleteBookmark,
    // userCollection, addUpload, addToCollection, removeFromCollection,
    // userBooqHistory, addBooqHistory, deleteBooqHistory,
    // deleteForId,
}

async function forId(id: string) {
    return (await collection).findById(id).exec()
}

async function createUser(user: Omit<DbUser, '_id' | 'username' | 'joined'>) {
    const username = await proposeUsername(user)
    const toAdd: Omit<DbUser, '_id'> = {
        ...user,
        username,
        joined: new Date(),
    }
    const [insertResult] = await (await collection).insertMany([toAdd])
    return insertResult
}

type UserDataForNameGeneration = {
    name?: string,
    email?: string,
}
export async function proposeUsername(user: UserDataForNameGeneration) {
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
