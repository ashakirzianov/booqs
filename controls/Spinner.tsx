import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons';
import { usePalette } from 'app';

export function Spinner() {
    const { highlight } = usePalette();
    return <FontAwesomeIcon
        icon={faSpinnerThird}
        color={highlight}
        spin
    />;
}