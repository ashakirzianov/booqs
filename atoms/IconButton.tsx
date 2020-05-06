import React from 'react';
import { Icon, IconName } from "./Icon";
import { meter, buttonSize } from "./meter";
import { usePalette } from "./theme";

export function IconButton({ icon, onClick }: {
    icon: IconName,
    onClick?: () => void,
}) {
    const { primary, highlight } = usePalette();
    return <button
        onClick={onClick}
    >
        <Icon name={icon} size={25} />
        <style jsx>{`
            button {
                display: flex;
                height: ${buttonSize};
                margin: ${meter.regular};
                color: ${primary};
                border: none;
            }
            button:hover {
                color: ${highlight};
            }
        `}</style>
    </button>;
}