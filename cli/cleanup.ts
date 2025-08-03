import { redis } from '@/backend/db'
import { CliOptions } from './main'

export async function cleanup(options: CliOptions) {
    const [command] = options.commands
    switch (command) {
        case 'cache':
            await removeRedisKeys('cache:*')
            return
        case 'images':
            await removeRedisKeys('images:*')
            return
        default:
            console.info('Unknown cleanup command: ', command)
            console.info('Available commands: cache, images')
            return
    }

}

async function removeRedisKeys(match: string) {
    let current = '0'
    const set = new Set<string>()
    let count = 0
    do {
        const [cursor, keys] = await redis.scan(current, {
            match,
            count: 1000,
        })
        console.info(`Batch ${count++}: Found ${keys.length} keys, current cursor: ${cursor}`)
        if (keys.length > 0) {
            await redis.del(...keys)
        }
        current = cursor
    } while (current !== '0')
    console.info(set)
}