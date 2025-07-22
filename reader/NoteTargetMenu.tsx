import { AuthorData, BooqId } from '@/core'
import type { ContextMenuTarget, NoteTarget } from './ContextMenuContent'
import { AuthorItem, SelectNoteColorItem, RemoveNoteItem, AddCommentItem, CopilotItem, CopyQuoteItem, CopyLinkItem } from './ContextMenuItems'

export function NoteTargetMenu({
    target, booqId, user, setTarget
}: {
    target: NoteTarget,
    booqId: BooqId,
    user: AuthorData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { note } = target
    const isOwnNote = user?.id === note.author?.id
    const selection = {
        range: note.range,
        text: note.targetQuote,
    }
    return <>
        {isOwnNote ? null :
            <AuthorItem
                name={note.author.name}
                pictureUrl={note.author.profilePictureURL ?? undefined}
                emoji={note.author.emoji}
                username={note.author.username}
            />
        }
        {!isOwnNote || !user ? null :
            <SelectNoteColorItem booqId={booqId} user={user} setTarget={setTarget} note={note} />
        }
        {!isOwnNote || !user ? null :
            <RemoveNoteItem booqId={booqId} user={user} setTarget={setTarget} note={note} />
        }
        <AddCommentItem target={target} user={user} setTarget={setTarget} />
        <CopilotItem selection={selection} setTarget={setTarget} />
        <CopyQuoteItem selection={selection} booqId={booqId} setTarget={setTarget} />
        <CopyLinkItem selection={selection} booqId={booqId} setTarget={setTarget} />
    </>
}