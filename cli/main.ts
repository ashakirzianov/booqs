import { syncWithGutenberg } from '@/backend/sync'
import { parseEpubs } from './parse'

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

async function main() {
    const options = parseCliOptions()
    const [command, ...subCommands] = options.commands
    switch (command) {
        case 'parse':
            await parseEpubs({
                ...options,
                commands: subCommands,
            })
            return
        default:
            console.info('Unknown command')
    }
    if (options.switches.worker === 'pgsync') {
        console.info('Running pg sync: S3 to Store...')
        await syncWithGutenberg({
            skipExistingS3: options.switches['skip-s3'] === 'true',
        })
    }
}

export type CliOptions = {
    switches: Record<string, string>,
    commands: string[],
}
function parseCliOptions(): CliOptions {
    const args = process.argv.slice(2)
    const options: CliOptions = {
        switches: {},
        commands: [],
    }
    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.split('=')
            const name = key.substring('--'.length)
            options.switches[name] = value ?? 'true'
        } else {
            options.commands.push(arg)
        }
    }
    return options
}