import React from 'react';
import { Booq, BooqNode } from '../app';

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
                (node, idx) => <Node key={idx} node={node} />,
            )
        }
    </>;
}

function Node({ node }: {
    node: BooqNode,
}) {
    if (node.children) {
        return <Nodes nodes={node.children} />;
    } else if (node.content !== undefined) {
        return <span>{node.content}</span>;
    } else {
        return <span>UNSUPPORTED</span>;
    }
}