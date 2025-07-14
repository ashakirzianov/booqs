'use client'

import { Modal } from '@/components/Modal'

const AVAILABLE_EMOJIS = [
    '😊', '😄', '😃', '😁', '😌', '😉', '😎', '🤓', '🤗', '😊',
    '😋', '😍', '🥰', '😘', '😗', '😙', '😚', '🤔', '🤨', '😐',
    '🙂', '😇', '🤠', '🥳', '🤡', '🤖', '👻', '👽', '🎭', '🎪',
    '🐱', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🦊',
    '🦝', '🦌', '🦄', '🐲', '🐙', '🦀', '🐠', '🐟', '🐡', '🦋',
    '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌿', '🍃', '🌱', '🌲',
    '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭',
    '🍍', '🥥', '🥑', '🍅', '🥒', '🥕', '🌽', '🥦', '🥬', '🌶️'
]

export function EmojiSelector({ isOpen, onClose, currentEmoji, onSelect }: {
    isOpen: boolean
    onClose: () => void
    currentEmoji?: string
    onSelect: (emoji: string) => void
}) {
    return (
        <Modal isOpen={isOpen} closeModal={onClose}>
            <div className="max-w-sm mx-auto p-6">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-primary mb-2">
                        Choose Your Emoji
                    </h2>
                    <p className="text-dimmed text-sm">
                        Select an emoji to represent your profile
                    </p>
                </div>

                <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                    {AVAILABLE_EMOJIS.map((emoji, index) => (
                        <button
                            key={index}
                            className={`p-3 text-2xl rounded-md hover:bg-dimmed/20 transition-colors duration-200 ${emoji === currentEmoji
                                    ? 'bg-primary/20 ring-2 ring-primary'
                                    : 'hover:bg-highlight/10'
                                }`}
                            onClick={() => {
                                onSelect(emoji)
                                onClose()
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 pt-4 mt-4 border-t border-dimmed">
                    <button
                        className="flex-1 px-4 py-2 text-dimmed font-medium border border-dimmed rounded-md hover:bg-dimmed/10 transition-colors duration-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    )
}