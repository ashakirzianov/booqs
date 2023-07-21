import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner as faSpinnerThird } from '@fortawesome/free-solid-svg-icons'
import { vars } from './theme'

export function Spinner() {
    return <FontAwesomeIcon
        icon={faSpinnerThird}
        color={`var(${vars.highlight})`}
        spin
    />
}