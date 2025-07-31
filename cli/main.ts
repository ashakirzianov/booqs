import { parseEpubs } from './parse'
import { pg } from './pg'
import { temp } from './temp'

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

async function main() {
    const options = parseCliOptions()
    const [command, ...subCommands] = options.commands
    const updatedOptions = { ...options, commands: subCommands }

    switch (command) {
        case 'parse':
            await parseEpubs(updatedOptions)
            return
        case 'pg':
            await pg(updatedOptions)
            return
        case 'temp':
            await temp(updatedOptions)
            return
        default:
            console.info('Unknown command: ', command)
            console.info('Available commands: parse, pg')
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