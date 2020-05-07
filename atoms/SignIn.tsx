import { WithPopover } from "./Popover";
import { IconButton } from "./IconButton";
import { Menu, MenuItem } from "./Menu";
import { meter } from "./meter";

export function SignInButton() {
    return <WithPopover
        placement="bottom"
        body={<SignInMenu />}
    >
        <IconButton icon="sign-in" />
    </WithPopover>;
}

function SignInMenu() {
    return <div>
        <span>Sign In</span>
        <Menu>
            <MenuItem icon="facebook" text="Facebook" />
        </Menu>
        <style jsx>{`
        div {
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: ${meter.regular} 0;
            align-items: stretch;
        }
        span {
            width: 100%;
            text-align: center;
            font-weight: bold;
            padding: ${meter.regular};
        }
        `}</style>
    </div>;
}
