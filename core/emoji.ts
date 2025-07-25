export const AVAILABLE_EMOJIS = [
    // Smileys & People
    '😊', '😄', '😃', '😁', '😌', '😉', '😎', '🤓', '🤗', '🙂', '😇', '🥳', '🤠', '🤡', '🤖', '👻', '👽', '🎭',
    // Animals & Characters
    '🐱', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🦊', '🦝', '🦄', '🐲', '🧙‍♂️', '🧙‍♀️', '🧛‍♂️', '🧛‍♀️', '🧟‍♂️', '🧟‍♀️', '🧞‍♂️', '🧞‍♀️', '🧜‍♂️', '🧜‍♀️', '🧚‍♂️', '🧚‍♀️', '🧑‍🚀', '🧑‍🎤', '🧑‍💻', '🧑‍🔬', '🧑‍🚒', '🧑‍🏫', '🧑‍🍳', '🧑‍🎨', '🧑‍✈️', '🧑‍🌾', '🧑‍🔧', '🧑‍⚕️', '🧑‍🎓', '🧑‍🏭', '🧑‍🔬'
]

export function getRandomAvatarEmoji() {
    return AVAILABLE_EMOJIS[Math.floor(Math.random() * AVAILABLE_EMOJIS.length)]
}