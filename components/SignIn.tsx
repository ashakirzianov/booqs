import { meter } from "../controls/theme";
import { Menu, MenuItem } from "../controls/Menu";

export function SignInPanel() {
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
