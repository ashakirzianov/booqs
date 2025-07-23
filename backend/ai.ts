import OpenAI from 'openai'

const AI_MODEL = 'o4-mini'

export type ReadingContext = {
    text: string,
    context: string,
    title?: string,
    author?: string,
    language?: string,
}
export async function generateSuggestions(context: ReadingContext) {
    const prompt = buildPromptForSuggestions(context)
    const result = await getResponse(prompt)
    if (!result) {
        return []
    }
    return parseSuggestion(result)
}

export async function generateAnswer(context: ReadingContext, question: string) {
    const prompt = buildPromptForAnswer(context, question)
    const result = await getResponse(prompt)
    if (!result) {
        return undefined
    }
    return result
}

function parseSuggestion(suggestion: string): string[] {
    return suggestion.split('?')
        .map(s => {
            const trimmed = trimNumberPrefix(s)
            if (trimmed === '') {
                return undefined
            } else {
                return trimmed + '?'
            }
        })
        .filter((s): s is string => s !== undefined)
}

function trimNumberPrefix(s: string) {
    return s.replace(/^\s*\d*[. ]/, '').trim()
}

function buildPromptForSuggestions(context: ReadingContext) {
    return `You are assisting user to read ${bookDescription(context)}. User might want to ask different questions about the particular part of the book. You'll be supplied with excerpt of the book and the context around it. You should suggest from 1 to 3 questions that user is likely to ask about the excerpt. Each question must be a single sentense and end with question mark.
        Prioritize this potential questions:
        - Questions about cultural references
        - Questions about used special terms if they are not obvious
        - Questions about previous interactions with the character (if you know the book well and if the character is mentioned in the excerpt)
        - Questions about meaning of the excerpt if it is not obvious
        
I selected excerpt "${context.text}" within the context "${context.context}". Please suggest questions that I might want to ask about this excerpt.`
}

function buildPromptForAnswer(context: ReadingContext, question: string) {
    return `You are assisting user to read ${bookDescription(context)}. User want to ask question "${question}" about the particular part of the book. You'll be supplied with excerpt of the book and the context around it. You should answer the question. If the book is well-known and studied, you should prioritize references to scholar interpritations of the book. If the book is not well-known, you should prioritize your own interpritation of the book.

I selected excerpt "${context.text}" within the context "${context.context}". My question is: ${question}.`
}

function bookDescription(context: ReadingContext) {
    let description = ''
    if (context.title) {
        description += `"${context.title}"`
    }
    if (context.author) {
        description += ` by ${context.author}`
    }
    if (context.language) {
        description += ` (in "${context.language}" language)`
    }
    return description
}


async function getResponse(input: string) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
    try {
        const response = await openai.responses.create({
            model: AI_MODEL,
            input,
        })
        return response.output_text || undefined
    } catch (e) {
        console.error('getResponse', e)
        return undefined
    }
}