import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch as faSpinnerThird, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { ReactNode } from 'react'

export function Spinner() {
    return <Container>
        <FontAwesomeIcon
            icon={faSpinnerThird}
            color={`var(--theme-dimmed)`}
            spin
        />
    </Container>
}

export function Ellipsis() {
    return <Container>
        <FontAwesomeIcon
            icon={faEllipsis}
            color={`var(--theme-dimmed)`}
            fade
        />
    </Container>
}

function Container({ children }: {
    children: ReactNode,
}) {
    return <div className='flex text-2xl w-8 h-8 items-center justify-center'>
        {children}
    </div>
}