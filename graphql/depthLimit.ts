import { Kind, ValidationContext, ASTVisitor, GraphQLError } from 'graphql'

export function depthLimitRule(maxDepth: number) {
    return function DepthLimit(context: ValidationContext): ASTVisitor {
        return {
            Document(node) {
                for (const definition of node.definitions) {
                    if (definition.kind === Kind.OPERATION_DEFINITION) {
                        const depth = measureDepth(definition)
                        if (depth > maxDepth) {
                            context.reportError(
                                new GraphQLError(
                                    `Query depth ${depth} exceeds maximum allowed depth of ${maxDepth}`,
                                ),
                            )
                        }
                    }
                }
            },
        }
    }
}

function measureDepth(node: { selectionSet?: { selections: readonly any[] } }): number {
    if (!node.selectionSet) {
        return 0
    }
    let max = 0
    for (const selection of node.selectionSet.selections) {
        const depth = measureDepth(selection)
        if (depth > max) {
            max = depth
        }
    }
    return max + 1
}
