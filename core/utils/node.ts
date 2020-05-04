import { BooqNode, BooqPath } from '../model';

export function nodeText(node: BooqNode): string {
    if (node.children?.length) {
        return node.children
            .map(nodeText)
            .join('');
    } else {
        return node.content ?? '';
    }
}

type BooqNodeIteratorValue = {
    node: BooqNode,
    path: BooqPath,
    position: number,
};
export function* iterateNodes(nodes: BooqNode[], path: BooqPath = [0], position = 0): Generator<BooqNodeIteratorValue, number> {
    const head = path.slice(0, path.length - 1);
    let idx = path[path.length - 1];
    for (const node of nodes) {
        const nextPath = [...head, idx];
        yield {
            node,
            position,
            path: nextPath,
        };
        if (node.children) {
            const children = iterateNodes(node.children, [...nextPath, 0], position);
            let child = children.next();
            while (!child.done) {
                yield child.value;
                child = children.next();
            }
            position += child.value;
        } else {
            position += node.content?.length ?? 1;
        }
        idx++;
    }
    return position;
}

export function processNode(node: BooqNode, f: (n: BooqNode) => BooqNode): BooqNode {
    return f({
        ...node,
        children: node.children?.map(ch => processNode(ch, f)),
    });
}

export async function processNodeAsync(node: BooqNode, f: (n: BooqNode) => Promise<BooqNode>): Promise<BooqNode> {
    return f({
        ...node,
        children: node.children
            ? await Promise.all(
                node.children.map(ch => processNodeAsync(ch, f))
            )
            : undefined,
    });
}

export function nodeLength(node: BooqNode): number {
    if (node.name) {
        if (node.children?.length) {
            return nodesLength(node.children);
        } else {
            return 1;
        }
    } else {
        return node.content?.length ?? 0;
    }
}

function nodesLength(nodes: BooqNode[]) {
    return nodes.reduce((len, n) => len + nodeLength(n), 0);
}
