export function Label({ text }: {
    text: string,
}) {
    return <span>
        {text}
        <style jsx>{`
            span {
                font-size: x-large;
            }
            `}</style>
    </span>;
}
