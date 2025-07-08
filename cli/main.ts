import { parseEpubs } from './parse'
import { sync } from './sync'

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

async function main() {
    let options = parseCliOptions()
    const [command, ...subCommands] = options.commands
    options = { ...options, commands: subCommands }
    switch (command) {
        case 'parse':
            await parseEpubs(options)
            return
        case 'sync':
            await sync(options)
        default:
            console.info('Unknown command')
    }
}

export type CliOptions = {
    switches: Record<string, string | undefined>,
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