import { readFile } from 'fs'
import path from 'path'

export async function readTypeDefs() {
    let root = process.cwd()
    let schemaPath = path.join(root, 'server/graphql/schema.graphql')
    return new Promise<string>((resolve, reject) => {
        readFile(schemaPath, {
            encoding: 'utf-8',
        }, (err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}