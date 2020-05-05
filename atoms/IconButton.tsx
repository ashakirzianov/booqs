import React from 'react';
import { Icon, IconName } from "./Icon";
import { regularMeter } from "./meter";
import { usePalette } from "./theme";

export function IconButton({ icon, onClick }: {
    icon: IconName,
    onClick?: () => void,
}) {
    const { primary, highlight } = usePalette();
    return <div
        onClick={onClick}
    >
        <Icon name={icon} />
        <style jsx>{`
            div {
            margin: ${regularMeter};
            color: ${primary};
            }
            div:hover {
                color: ${highlight};
            }
        `}</style>
    </div>;
}