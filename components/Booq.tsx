import React, { createElement, ReactNode } from 'react';
import { Booq, BooqNode, BooqPath, pathToString } from '../app';
import { bookFont } from '../controls/theme';

export function BooqScreen({ booq }: {
    booq: Booq,
}) {
    return <div className='container'>
        <Content booq={booq} />
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
            }
            `}</style>
    </div>;
}

const contentWidth = '50rem';
function Content({ booq }: {
    booq: Booq,
}) {
    const nodes = booq.nodesConnection.edges.map(e => e.node);
    return <div className='container'>
        <div className='content'>
            {
                nodes.map(
                    (node, idx) => renderNode({ node, path: [idx] }),
                )
            }
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: column;
                align-items: center;
                width: 100%;
                max-width: ${contentWidth};
                font-family: ${bookFont};
            }
            `}</style>
    </div>;
}

type RenderArgs = {
    node: BooqNode,
    path: BooqPath,
};
function renderNode(args: RenderArgs): ReactNode {
    const { name, id, content } = args.node;
    if (!name) {
        return content ?? null;
    } else {
        const element = createElement(
            name,
            getProps(args),
            getChildren(args),
        );
        if (id) {
            const anchor = createElement('a', { id, key: id });
            return [anchor, element];
        } else {
            return element;
        }
    }
}

function getProps({ node, path }: RenderArgs) {
    return {
        ...node.attrs,
        id: `path:${pathToString(path)}`,
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
