import {
    updateHighlight, removeHighlight,
} from '@/backend/highlights'
import { getUserIdInsideRequest } from '@/data/auth'
import { NextRequest } from 'next/server'

type Params = {
    id: string,
}
type HighlightJson = {
    id: string,
    booqId: string,
    userId: string,
    start: number[],
    end: number[],
    color: string,
    note: string | null,
    createdAt: string,
    updatedAt: string,
}
export type PatchBody = Partial<Pick<HighlightJson, 'color' | 'note'>>
export type PatchResponse = HighlightJson
export async function PATCH(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const { color, note }: PatchBody = await request.json()
    const hl = await updateHighlight({
        id,
        userId,
        color: color,
        note: note ?? undefined,
    })
    if (!hl) {
        return Response.json({ error: 'Highlight not found' }, { status: 404 })
    }
    const result: PatchResponse = {
        id: hl.id,
        booqId: hl.booq_id,
        userId: hl.user_id,
        start: hl.start_path,
        end: hl.end_path,
        color: hl.color,
        note: hl.note,
        createdAt: hl.created_at,
        updatedAt: hl.updated_at,
    }
    return Response.json(result)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<Params> }) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const success = await removeHighlight({
        id, userId,
    })
    if (success) {
        return Response.json(null, { status: 204 })
    } else {
        return Response.json({ error: 'Highlight not found' }, { status: 404 })
    }
}