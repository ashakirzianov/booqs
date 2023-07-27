import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner as faSpinnerThird } from '@fortawesome/free-solid-svg-icons'

export function Spinner() {
    return <FontAwesomeIcon
        icon={faSpinnerThird}
        color={`var(--theme-highlight)`}
        spin
    />
}