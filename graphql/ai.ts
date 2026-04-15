import { generateAiReply } from '@/backend/ask'
import { IResolvers } from '@graphql-tools/utils'
import { ResolverContext } from './context'

export const aiResolver: IResolvers = {
    Subscription: {
        generateReply: {
            async *subscribe(_: unknown, { noteId }: {
                noteId: string,
            }, { userId }: ResolverContext) {
                if (!userId) {
                    return
                }
                const result = await generateAiReply(noteId)
                if (!result.success) {
                    return
                }
                const reader = result.stream.getReader()
                const decoder = new TextDecoder()
                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break
                        yield { generateReply: decoder.decode(value) }
                    }
                } finally {
                    reader.releaseLock()
                }
            },
        },
    },
}
