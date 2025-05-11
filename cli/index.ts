import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })
console.info('Loaded .env variables')

import('./main')