const ADJECTIVES = [
    'Adventurous', 'Ambitious', 'Artistic', 'Brave', 'Brilliant', 'Calm', 'Charming', 'Clever',
    'Creative', 'Curious', 'Daring', 'Delightful', 'Dynamic', 'Elegant', 'Energetic', 'Enthusiastic',
    'Fabulous', 'Fantastic', 'Fearless', 'Friendly', 'Gentle', 'Graceful', 'Happy', 'Imaginative',
    'Incredible', 'Inspiring', 'Intelligent', 'Joyful', 'Kind', 'Lively', 'Magical', 'Marvelous',
    'Mighty', 'Noble', 'Optimistic', 'Outstanding', 'Peaceful', 'Playful', 'Pleasant', 'Polite',
    'Proud', 'Quick', 'Quiet', 'Radiant', 'Remarkable', 'Respectful', 'Respectable', 'Serene',
    'Serious', 'Sincere', 'Smart', 'Spectacular', 'Spirited', 'Stellar', 'Strong', 'Thoughtful',
    'Tremendous', 'Vibrant', 'Vivacious', 'Warm', 'Wise', 'Wonderful', 'Zealous'
]

const ANIMALS = [
    'Albatross', 'Antelope', 'Armadillo', 'Badger', 'Butterfly', 'Camel', 'Chameleon', 'Cheetah',
    'Chinchilla', 'Dolphin', 'Eagle', 'Elephant', 'Falcon', 'Flamingo', 'Fox', 'Giraffe',
    'Hamster', 'Hedgehog', 'Hummingbird', 'Iguana', 'Jaguar', 'Kangaroo', 'Koala', 'Lemur',
    'Leopard', 'Lion', 'Llama', 'Lobster', 'Lynx', 'Manatee', 'Meerkat', 'Narwhal',
    'Octopus', 'Otter', 'Owl', 'Panda', 'Parrot', 'Peacock', 'Pelican', 'Penguin',
    'Phoenix', 'Platypus', 'Porcupine', 'Quail', 'Rabbit', 'Raccoon', 'Seahorse', 'Sloth',
    'Sparrow', 'Squirrel', 'Swan', 'Tiger', 'Toucan', 'Turtle', 'Unicorn', 'Walrus',
    'Whale', 'Wolf', 'Zebra'
]

const OBJECTS = [
    'Book', 'Compass', 'Crystal', 'Diamond', 'Engine', 'Feather', 'Galaxy', 'Hammer',
    'Island', 'Journal', 'Kite', 'Lighthouse', 'Mirror', 'Notebook', 'Ocean', 'Piano',
    'Quill', 'Rainbow', 'Satellite', 'Telescope', 'Umbrella', 'Violin', 'Window', 'Xylophone'
]

const CHARACTERS = [
    'Archer', 'Artist', 'Captain', 'Chef', 'Detective', 'Explorer', 'Guardian', 'Inventor',
    'Knight', 'Librarian', 'Magician', 'Navigator', 'Pilot', 'Poet', 'Robot', 'Scientist',
    'Storyteller', 'Traveler', 'Wizard'
]

export function generateRandomName(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    
    // Randomly choose between animals, objects, and characters for the "last name"
    const allNouns = [...ANIMALS, ...OBJECTS, ...CHARACTERS]
    const noun = allNouns[Math.floor(Math.random() * allNouns.length)]
    
    return `${adjective} ${noun}`
}