export function SignUpErrorPage({
    title,
    message,
    description
}: {
    title: string
    message: string
    description: string
}) {
    return (
        <div className='flex flex-col items-center gap-4 w-full max-w-md text-center'>
            <div className='flex flex-col items-center gap-4 max-w-md text-center'>
                <h1 className='text-2xl font-bold text-alert'>{title}</h1>
                <p className='text-lg'>{message}</p>
                <p className='text-sm text-secondary'>
                    {description}
                </p>
            </div>
            <div className='flex gap-4 p-4'>
                <a
                    href="/auth"
                    className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors'
                >
                    Request New Link
                </a>
                <a
                    href="/auth"
                    className='px-6 py-3 border border-action text-action rounded-lg hover:bg-action hover:text-white transition-colors'
                >
                    Sign In Instead
                </a>
            </div>
        </div>
    )
}