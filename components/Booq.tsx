import React, { createElement, ReactNode } from 'react';
import { Booq, BooqNode, BooqPath, pathToString } from '../app';

export function BooqScreen({ booq }: {
    booq: Booq,
}) {
    return <Content booq={booq} />;
}

function Content({ booq }: {
    booq: Booq,
}) {
    const nodes = booq.nodesConnection.edges.map(e => e.node);
    return <Nodes nodes={nodes} />;
}

function Nodes({ nodes }: {
    nodes: BooqNode[],
}) {
    return <>
        {
            nodes.map(
                (node, idx) => renderNode({ node, path: [idx] }),
            )
        }
    </>;
}

type RenderArgs = {
    node: BooqNode,
    path: BooqPath,
};
function renderNode(args: RenderArgs): ReactNode {
    const name = args.node.name;
    const props = getProps(args);
    switch (name) {
        case undefined:
            return args.node.content;
        case 'file':
            return createElement(
                'div', props,
                getChildren(args),
            );
        case 'img': // TODO: proper src
        case 'br':
            return createElement(name, props);
        case 'div': case 'span': case 'p':
        case 'small': case 'i':
        case 'a': // TODO: support links
            return createElement(name, props, getChildren(args));
        default:
            return createElement(
                'span',
                {
                    key: pathToString(args.path),
                    style: { color: 'red' },
                },
                `Unsupported: ${name}`,
            );
    }
}

function getProps({ node, path }: RenderArgs) {
    return {
        ...node.attrs,
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
