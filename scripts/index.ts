import { config } from 'dotenv'


// Your script logic
async function main() {
    console.info('Running script in Next.js context')
    config({ path: '.env' })
    config({ path: '.env.local' })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})