import React from 'react'

export function Logo() {
    return <div className='font-normal' style={{
        color: 'rgba(253,163,2,1)',
        fontFamily: 'var(--font-main)',
        fontSize: 'x-large',
        background: '-webkit-linear-gradient(180deg, rgba(253,163,2,1) 50%, rgb(200, 145, 2) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        cursor: 'default',
        userSelect: 'none',
    }}>
        BOOQS
    </div>
}
