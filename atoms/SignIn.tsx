import { WithPopover } from "./Popover";
import { IconButton } from "./IconButton";

export function SignInButton() {
    return <WithPopover
        placement="bottom"
        body={<SignInMenu />}
    >
        <IconButton icon="sign-in" />
    </WithPopover>;
}

function SignInMenu() {
    return <span>Sign In</span>;
}
