import React from 'react';
import { Icon, IconName } from "./Icon";
import { regularMeter, buttonSize } from "./meter";
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
                margin: ${regularMeter};
                color: ${primary};
                border: none;
            }
            button:hover {
                color: ${highlight};
            }
        `}</style>
    </button>;
}