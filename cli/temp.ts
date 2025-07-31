import { redis } from '@/backend/db'
import { CliOptions } from './main'

export async function temp(_options: CliOptions) {
    let current = '0'
    const set = new Set<string>()
    let count = 0
    do {
        const [cursor, keys] = await redis.scan(current, {
            match: 'cache:*',
            count: 1000,
        })
        await redis.del(...keys)
        console.log(`Batch ${count++}: Found ${keys.length} keys, current cursor: ${cursor}`)
        current = cursor
    } while (current !== '0')
    console.log(set)
}