'use server'

import { revalidatePath } from 'next/cache'
import { updateAccountAction } from '@/data/auth'

export async function updateProfileServerAction(formData: FormData) {
    const emoji = formData.get('emoji') as string
    const name = formData.get('name') as string
    
    const result = await updateAccountAction({ emoji, name })
    
    if (result) {
        revalidatePath('/account')
        return result
    }
    
    return null
}