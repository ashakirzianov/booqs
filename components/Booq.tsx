import React, { createElement, ReactNode } from 'react';
import { Booq, BooqNode, BooqPath, pathToString } from '../app';
import { bookFont } from '../controls/theme';

export function BooqScreen({ booq }: {
    booq: Booq,
}) {
    return <Content booq={booq} />;
}

function Content({ booq }: {
    booq: Booq,
}) {
    const nodes = booq.nodesConnection.edges.map(e => e.node);
    return <div>
        {
            nodes.map(
                (node, idx) => renderNode({ node, path: [idx] }),
            )
        }
        <style jsx>{`
            font-family: ${bookFont};
            `}</style>
    </div>;
}

type RenderArgs = {
    node: BooqNode,
    path: BooqPath,
};
function renderNode(args: RenderArgs): ReactNode {
    const name = args.node.name;
    if (!name) {
        return args.node.content ?? null;
    } else {
        return createElement(
            name,
            getProps(args),
            getChildren(args),
        );
    }
}

function getProps({ node, path }: RenderArgs) {
    return {
        ...node.attrs,
        style: node.style,
        key: pathToString(path),
    };
}

function getChildren({ node, path }: RenderArgs) {
    return node.children?.length
        ? node.children.map(
            (n, idx) => renderNode({ node: n, path: [...path, idx] })
        )
        : null;
}
