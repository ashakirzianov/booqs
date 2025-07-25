'use server'

import { revalidatePath } from 'next/cache'
import { updateAccountAction } from '@/data/auth'

export async function updateProfileServerAction(formData: FormData) {
    const emoji = formData.get('emoji') as string
    const name = formData.get('name') as string
    const username = formData.get('username') as string
    
    const result = await updateAccountAction({ 
        emoji, 
        name, 
        username: username || undefined 
    })
    
    if (result.success) {
        revalidatePath('/account')
        return { success: true, user: result.user }
    }
    
    return { success: false, error: result.error }
}

