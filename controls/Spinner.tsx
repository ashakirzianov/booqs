import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons';
import { vars } from './theme';

export function Spinner() {
    return <FontAwesomeIcon
        icon={faSpinnerThird}
        color={`var(${vars.highlight})`}
        spin
    />;
}