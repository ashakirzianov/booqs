import { generateCopilotAnswer } from '@/data/copilot'
import { BooqId } from '@/core'
import { getUserIdInsideRequest } from '@/data/request'
import { z } from 'zod'

const postBodySchema = z.object({
    booqId: z.string().regex(/^[a-z]+-\S+$/) as z.ZodType<BooqId>,
    start: z.array(z.number().int().min(0)),
    end: z.array(z.number().int().min(0)),
    question: z.string().min(1).max(2000),
})

export type PostBody = z.infer<typeof postBodySchema>

export type PostResponse = string

export async function POST(request: Request) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = postBodySchema.safeParse(await request.json())
    if (!parsed.success) {
        return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }
    const { booqId, start, end, question } = parsed.data

    const result = await generateCopilotAnswer({
        booqId,
        range: { start, end },
        question
    })

    if (!result.success || !result.output) {
        return Response.json({ error: 'No answer found' }, { status: 404 })
    }

    const response: PostResponse = result.output
    return Response.json(response)
}