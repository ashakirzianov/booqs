import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinnerThird } from '@fortawesome/pro-light-svg-icons';

export function Spinner() {
    return <FontAwesomeIcon
        icon={faSpinnerThird}
        spin
    />;
}