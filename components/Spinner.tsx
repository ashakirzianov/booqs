import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch as faSpinnerThird } from '@fortawesome/free-solid-svg-icons'

export function Spinner() {
    return <div className='flex text-2xl w-8 h-8 items-center justify-center'>
        <FontAwesomeIcon
            icon={faSpinnerThird}
            color={`var(--theme-dimmed)`}
            spin
        />
    </div>
}