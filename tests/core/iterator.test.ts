import {
  BooqIterator,
  BooqNodeIterator,
  BooqTextIterator,
  isNodeIterator,
  isTextIterator,
  iteratorLessThan,
  iteratorAtPath,
  iteratorsPath,
  iteratorsNode,
  firstLeafNode,
  lastLeafNode,
  nextLeafNode,
  prevLeafNode,
  nextSibling,
  prevSibling,
  nextIterator,
  prevIterator,
  textBefore,
  textStartingAt,
} from '../../core/iterator'
import { BooqNode, BooqElementNode, BooqTextNode, BooqPath } from '../../core/model'

describe('core/iterator', () => {
  // Test data setup helpers
  const createTextNode = (content: string): BooqTextNode => ({
    kind: 'text',
    content,
  })

  const createElement = (name: string, children?: BooqNode[]): BooqElementNode => ({
    kind: 'element',
    name,
    children,
  })

  // Test data structures
  const simpleTextNode = createTextNode('Hello World')
  const stubNode: BooqNode = { kind: 'stub', length: 10 }
  const nullNode: BooqNode = null

  const simpleElement = createElement('p', [
    createTextNode('First '),
    createTextNode('Second'),
  ])

  const nestedElement = createElement('div', [
    createElement('span', [createTextNode('Nested text')]),
    createTextNode(' Middle '),
    createElement('em', [createTextNode('Emphasized')]),
  ])

  // Complex test structure:
  // [0] <p>Paragraph one.</p>
  // [1] "Root text. "
  // [2] <div>
  //   [0] "Div start "
  //   [1] <span>Span content</span>
  //   [2] " Div end"
  // </div>
  // [3] " Final text."
  const complexNodes: BooqNode[] = [
    createElement('p', [createTextNode('Paragraph one.')]),
    createTextNode('Root text. '),
    createElement('div', [
      createTextNode('Div start '),
      createElement('span', [createTextNode('Span content')]),
      createTextNode(' Div end'),
    ]),
    createTextNode(' Final text.'),
  ]

  // Helper to create node iterators
  function createNodeIterator(
    node: BooqElementNode,
    index: number,
    parent?: BooqNodeIterator
  ): BooqNodeIterator {
    return { node, index, parent }
  }

  // Helper to create text iterators
  function createTextIterator(
    node: BooqTextNode,
    index: number,
    parent: BooqNodeIterator
  ): BooqTextIterator {
    return { node, index, parent }
  }

  describe('Type checking functions', () => {
    describe('isNodeIterator', () => {
      it('returns true for node iterators', () => {
        const nodeIter = createNodeIterator(simpleElement, 0)
        expect(isNodeIterator(nodeIter)).toBe(true)
      })

      it('returns false for text iterators', () => {
        const parent = createNodeIterator(simpleElement, 0)
        const textIter = createTextIterator(simpleTextNode, 5, parent)
        expect(isNodeIterator(textIter)).toBe(false)
      })

      it('handles undefined node gracefully', () => {
        const iterWithUndefinedNode = { node: undefined as any, index: 0, parent: undefined }
        expect(isNodeIterator(iterWithUndefinedNode)).toBe(false)
      })
    })

    describe('isTextIterator', () => {
      it('returns true for text iterators', () => {
        const parent = createNodeIterator(simpleElement, 0)
        const textIter = createTextIterator(simpleTextNode, 5, parent)
        expect(isTextIterator(textIter)).toBe(true)
      })

      it('returns false for node iterators', () => {
        const nodeIter = createNodeIterator(simpleElement, 0)
        expect(isTextIterator(nodeIter)).toBe(false)
      })

      it('handles undefined node gracefully', () => {
        const iterWithUndefinedNode = { node: undefined as any, index: 0, parent: undefined }
        expect(isTextIterator(iterWithUndefinedNode)).toBe(false)
      })
    })
  })

  describe('iteratorAtPath', () => {
    it('returns iterator for valid path to element node', () => {
      const result = iteratorAtPath(complexNodes, [0])
      expect(result).toBeDefined()
      expect(result!.index).toBe(0)
      expect(result!.node.name).toBe('root')
      expect(result!.parent).toBeUndefined()
    })

    it('returns iterator for path to text node', () => {
      const result = iteratorAtPath(complexNodes, [1, 5])
      expect(result).toBeDefined()
      expect(isTextIterator(result!)).toBe(true)
      const textIter = result as BooqTextIterator
      expect(textIter.index).toBe(5)
      expect(textIter.node.content).toBe('Root text. ')
    })

    it('returns iterator for nested element path', () => {
      const result = iteratorAtPath(complexNodes, [2, 1])
      expect(result).toBeDefined()
      expect(result!.index).toBe(1)
      expect(result!.parent?.index).toBe(2)
    })

    it('returns iterator for deeply nested text node', () => {
      const result = iteratorAtPath(complexNodes, [2, 1, 0, 4])
      expect(result).toBeDefined()
      expect(isTextIterator(result!)).toBe(true)
      const textIter = result as BooqTextIterator
      expect(textIter.index).toBe(4)
      expect(textIter.node.content).toBe('Span content')
    })

    it('returns undefined for invalid path - out of bounds', () => {
      const result = iteratorAtPath(complexNodes, [10])
      expect(result).toBeUndefined()
    })

    it('returns undefined for invalid path - too deep into text node', () => {
      const result = iteratorAtPath(complexNodes, [1, 5, 0])
      expect(result).toBeUndefined()
    })

    it('returns undefined for empty path', () => {
      const result = iteratorAtPath(complexNodes, [])
      expect(result).toBeUndefined()
    })

    it('returns undefined for path into stub node', () => {
      const nodesWithStub = [stubNode, createTextNode('text')]
      const result = iteratorAtPath(nodesWithStub, [0, 0])
      expect(result).toBeUndefined()
    })

    it('returns undefined for path into null node', () => {
      const nodesWithNull = [nullNode, createTextNode('text')]
      const result = iteratorAtPath(nodesWithNull, [0, 0])
      expect(result).toBeUndefined()
    })

    it('handles empty children array', () => {
      const emptyElement = createElement('div', [])
      const nodes = [emptyElement]
      const result = iteratorAtPath(nodes, [0, 0])
      expect(result).toBeUndefined()
    })
  })

  describe('iteratorsPath', () => {
    it('returns path for root node iterator', () => {
      const iter = createNodeIterator(simpleElement, 2)
      const path = iteratorsPath(iter)
      expect(path).toEqual([2])
    })

    it('returns path for nested node iterator', () => {
      const parent = createNodeIterator(simpleElement, 1)
      const child = createNodeIterator(nestedElement, 3, parent)
      const path = iteratorsPath(child)
      expect(path).toEqual([1, 3])
    })

    it('returns path for text iterator', () => {
      const parent = createNodeIterator(simpleElement, 0)
      const textIter = createTextIterator(simpleTextNode, 5, parent)
      const path = iteratorsPath(textIter)
      expect(path).toEqual([0, 5])
    })

    it('returns path for deeply nested iterator', () => {
      const root = createNodeIterator(simpleElement, 0)
      const level1 = createNodeIterator(nestedElement, 1, root)
      const level2 = createNodeIterator(simpleElement, 2, level1)
      const path = iteratorsPath(level2)
      expect(path).toEqual([0, 1, 2])
    })
  })

  describe('iteratorsNode', () => {
    it('returns child node for node iterator', () => {
      const iter = iteratorAtPath(complexNodes, [0])!
      const node = iteratorsNode(iter)
      expect(node).toBeDefined()
      expect(node!.kind).toBe('element')
      const elementNode = node as BooqElementNode
      expect(elementNode.name).toBe('p')
    })

    it('returns undefined for text iterator', () => {
      const parent = createNodeIterator(simpleElement, 0)
      const textIter = createTextIterator(simpleTextNode, 5, parent)
      const node = iteratorsNode(textIter)
      expect(node).toBeUndefined()
    })

    it('returns undefined when index is out of bounds', () => {
      const iter = createNodeIterator(simpleElement, 10)
      const node = iteratorsNode(iter)
      expect(node).toBeUndefined()
    })

    it('returns undefined when element has no children', () => {
      const emptyElement = createElement('br')
      const iter = createNodeIterator(emptyElement, 0)
      const node = iteratorsNode(iter)
      expect(node).toBeUndefined()
    })
  })

  describe('Leaf node navigation', () => {
    describe('firstLeafNode', () => {
      it('returns itself for iterator pointing to text node', () => {
        const iter = iteratorAtPath(complexNodes, [1])!
        const leaf = firstLeafNode(iter)
        expect(leaf).toBe(iter)
      })

      it('returns first leaf for element with text children', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const leaf = firstLeafNode(iter)
        expect(leaf.index).toBe(0)
        expect(leaf.parent).toBe(iter)
      })

      it('returns deeply nested first leaf', () => {
        const iter = iteratorAtPath(complexNodes, [2])!
        const leaf = firstLeafNode(iter)
        expect(leaf.index).toBe(0)
        expect(leaf.parent?.index).toBe(2)
      })

      it('handles nested elements', () => {
        const iter = iteratorAtPath(complexNodes, [2, 1])!
        const leaf = firstLeafNode(iter)
        expect(leaf.index).toBe(0)
        expect(leaf.parent?.index).toBe(1)
        expect(leaf.parent?.parent?.index).toBe(2)
      })
    })

    describe('lastLeafNode', () => {
      it('returns itself for iterator pointing to text node', () => {
        const iter = iteratorAtPath(complexNodes, [1])!
        const leaf = lastLeafNode(iter)
        expect(leaf).toBe(iter)
      })

      it('returns last leaf for element with text children', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const leaf = lastLeafNode(iter)
        expect(leaf.index).toBe(0) // Only one child
        expect(leaf.parent).toBe(iter)
      })

      it('returns deeply nested last leaf', () => {
        const iter = iteratorAtPath(complexNodes, [2])!
        const leaf = lastLeafNode(iter)
        expect(leaf.index).toBe(2) // Last child in div
        expect(leaf.parent?.index).toBe(2)
      })

      it('handles nested elements', () => {
        const iter = iteratorAtPath(complexNodes, [2, 1])!
        const leaf = lastLeafNode(iter)
        expect(leaf.index).toBe(0) // Only child in span
        expect(leaf.parent?.index).toBe(1)
        expect(leaf.parent?.parent?.index).toBe(2)
      })

      it('handles empty children', () => {
        const emptyElement = createElement('br')
        const nodes = [emptyElement]
        const iter = iteratorAtPath(nodes, [0])!
        const leaf = lastLeafNode(iter)
        expect(leaf).toBe(iter)
      })
    })

    describe('nextLeafNode', () => {
      it('returns next leaf node iterator', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const nextLeaf = nextLeafNode(iter)
        expect(nextLeaf).toBeDefined()
        expect(nextLeaf!.index).toBe(1)
        expect(nextLeaf!.parent).toBeUndefined()
      })

      it('returns undefined when no next leaf exists', () => {
        const iter = iteratorAtPath(complexNodes, [3])!
        const nextLeaf = nextLeafNode(iter)
        expect(nextLeaf).toBeUndefined()
      })

      it('skips to next leaf in nested structure', () => {
        const iter = iteratorAtPath(complexNodes, [2, 0])!
        const nextLeaf = nextLeafNode(iter)
        expect(nextLeaf).toBeDefined()
        expect(nextLeaf!.index).toBe(0)
        expect(nextLeaf!.parent?.index).toBe(1)
      })

      it('returns undefined for text iterator at end', () => {
        const textIter = iteratorAtPath(complexNodes, [3, 5])!
        const nextLeaf = nextLeafNode(textIter)
        expect(nextLeaf).toBeUndefined()
      })
    })

    describe('prevLeafNode', () => {
      it('returns previous leaf node iterator', () => {
        const iter = iteratorAtPath(complexNodes, [1])!
        const prevLeaf = prevLeafNode(iter)
        expect(prevLeaf).toBeDefined()
        expect(prevLeaf!.index).toBe(0)
        expect(prevLeaf!.parent?.index).toBe(0)
      })

      it('returns undefined when no previous leaf exists', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const prevLeaf = prevLeafNode(iter)
        expect(prevLeaf).toBeUndefined()
      })

      it('finds previous leaf in nested structure', () => {
        const iter = iteratorAtPath(complexNodes, [2, 2])!
        const prevLeaf = prevLeafNode(iter)
        expect(prevLeaf).toBeDefined()
        expect(prevLeaf!.index).toBe(0)
        expect(prevLeaf!.parent?.index).toBe(1)
      })

      it('returns undefined for text iterator at beginning', () => {
        const textIter = iteratorAtPath(complexNodes, [0, 0, 0])!
        const prevLeaf = prevLeafNode(textIter)
        expect(prevLeaf).toBeUndefined()
      })
    })
  })

  describe('Sibling navigation', () => {
    describe('nextSibling', () => {
      it('returns next sibling for node iterator', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const next = nextSibling(iter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(1)
        expect(next!.node).toBe(iter.node)
        expect(next!.parent).toBe(iter.parent)
      })

      it('returns next sibling for text iterator', () => {
        const textIter = iteratorAtPath(complexNodes, [1, 5])!
        const next = nextSibling(textIter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(6)
      })

      it('returns undefined when at last sibling', () => {
        const iter = iteratorAtPath(complexNodes, [3])!
        const next = nextSibling(iter)
        expect(next).toBeUndefined()
      })

      it('works with nested iterators', () => {
        const iter = iteratorAtPath(complexNodes, [2, 0])!
        const next = nextSibling(iter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(1)
      })

      it('handles text content boundaries', () => {
        const textNode = createTextNode('abc')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 2, parent)
        const next = nextSibling(textIter)
        expect(next).toBeUndefined()
      })
    })

    describe('prevSibling', () => {
      it('returns previous sibling for node iterator', () => {
        const iter = iteratorAtPath(complexNodes, [1])!
        const prev = prevSibling(iter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(0)
        expect(prev!.node).toBe(iter.node)
        expect(prev!.parent).toBe(iter.parent)
      })

      it('returns previous sibling for text iterator', () => {
        const textIter = iteratorAtPath(complexNodes, [1, 5])!
        const prev = prevSibling(textIter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(4)
      })

      it('returns undefined when at first sibling', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const prev = prevSibling(iter)
        expect(prev).toBeUndefined()
      })

      it('works with nested iterators', () => {
        const iter = iteratorAtPath(complexNodes, [2, 1])!
        const prev = prevSibling(iter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(0)
      })

      it('handles text content boundaries', () => {
        const textNode = createTextNode('abc')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 0, parent)
        const prev = prevSibling(textIter)
        expect(prev).toBeUndefined()
      })
    })
  })

  describe('Iterator navigation', () => {
    describe('nextIterator', () => {
      it('returns next sibling when available', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const next = nextIterator(iter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(1)
        expect(next!.parent).toBe(iter.parent)
      })

      it('moves up to parent when no next sibling', () => {
        const iter = iteratorAtPath(complexNodes, [2, 2])!
        const next = nextIterator(iter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(3)
        expect(next!.parent).toBeUndefined()
      })

      it('returns undefined at end of document', () => {
        const iter = iteratorAtPath(complexNodes, [3])!
        const next = nextIterator(iter)
        expect(next).toBeUndefined()
      })

      it('works with text iterators', () => {
        const textIter = iteratorAtPath(complexNodes, [1, 5])!
        const next = nextIterator(textIter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(6)
      })

      it('moves up from deeply nested position', () => {
        const iter = iteratorAtPath(complexNodes, [2, 1, 0, 5])!
        const next = nextIterator(iter)
        expect(next).toBeDefined()
        expect(next!.index).toBe(6)
        expect(next!.parent?.index).toBe(0)
        expect(next!.parent?.parent?.index).toBe(1)
        expect(next!.parent?.parent?.parent?.index).toBe(2)
      })
    })

    describe('prevIterator', () => {
      it('returns previous sibling when available', () => {
        const iter = iteratorAtPath(complexNodes, [1])!
        const prev = prevIterator(iter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(0)
        expect(prev!.parent).toBe(iter.parent)
      })

      it('moves up to parent when no previous sibling', () => {
        const iter = iteratorAtPath(complexNodes, [2, 0])!
        const prev = prevIterator(iter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(1)
        expect(prev!.parent).toBeUndefined()
      })

      it('returns undefined at beginning of document', () => {
        const iter = iteratorAtPath(complexNodes, [0])!
        const prev = prevIterator(iter)
        expect(prev).toBeUndefined()
      })

      it('works with text iterators', () => {
        const textIter = iteratorAtPath(complexNodes, [1, 5])!
        const prev = prevIterator(textIter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(4)
      })

      it('moves up from deeply nested position', () => {
        const iter = iteratorAtPath(complexNodes, [2, 1, 0, 0])!
        const prev = prevIterator(iter)
        expect(prev).toBeDefined()
        expect(prev!.index).toBe(0)
        expect(prev!.parent?.index).toBe(2)
      })
    })
  })

  describe('Text manipulation', () => {
    describe('textBefore', () => {
      it('returns text before index', () => {
        const textNode = createTextNode('Hello World')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 5, parent)
        const result = textBefore(textIter)
        expect(result).toBe('Hello')
      })

      it('returns empty string for index 0', () => {
        const textNode = createTextNode('Hello World')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 0, parent)
        const result = textBefore(textIter)
        expect(result).toBe('')
      })

      it('returns full content for index beyond length', () => {
        const textNode = createTextNode('Hello')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 10, parent)
        const result = textBefore(textIter)
        expect(result).toBe('Hello')
      })

      it('handles empty content', () => {
        const textNode = createTextNode('')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 0, parent)
        const result = textBefore(textIter)
        expect(result).toBe('')
      })
    })

    describe('textStartingAt', () => {
      it('returns text starting at index', () => {
        const textNode = createTextNode('Hello World')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 6, parent)
        const result = textStartingAt(textIter)
        expect(result).toBe('World')
      })

      it('returns full content for index 0', () => {
        const textNode = createTextNode('Hello World')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 0, parent)
        const result = textStartingAt(textIter)
        expect(result).toBe('Hello World')
      })

      it('returns empty string for index at end', () => {
        const textNode = createTextNode('Hello')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 5, parent)
        const result = textStartingAt(textIter)
        expect(result).toBe('')
      })

      it('returns empty string for index beyond length', () => {
        const textNode = createTextNode('Hello')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 10, parent)
        const result = textStartingAt(textIter)
        expect(result).toBe('')
      })

      it('handles empty content', () => {
        const textNode = createTextNode('')
        const parent = createNodeIterator(createElement('p', [textNode]), 0)
        const textIter = createTextIterator(textNode, 0, parent)
        const result = textStartingAt(textIter)
        expect(result).toBe('')
      })
    })
  })

  describe('iteratorLessThan', () => {
    it('compares iterators at same level', () => {
      const iter1 = iteratorAtPath(complexNodes, [0])!
      const iter2 = iteratorAtPath(complexNodes, [1])!
      expect(iteratorLessThan(iter1, iter2)).toBe(true)
      expect(iteratorLessThan(iter2, iter1)).toBe(false)
    })

    it('compares iterators at different levels', () => {
      const iter1 = iteratorAtPath(complexNodes, [2, 0])!
      const iter2 = iteratorAtPath(complexNodes, [2, 1])!
      expect(iteratorLessThan(iter1, iter2)).toBe(true)
      expect(iteratorLessThan(iter2, iter1)).toBe(false)
    })

    it('compares text iterators', () => {
      const iter1 = iteratorAtPath(complexNodes, [1, 3])!
      const iter2 = iteratorAtPath(complexNodes, [1, 7])!
      expect(iteratorLessThan(iter1, iter2)).toBe(true)
      expect(iteratorLessThan(iter2, iter1)).toBe(false)
    })

    it('returns false for identical iterators', () => {
      const iter1 = iteratorAtPath(complexNodes, [2, 1])!
      const iter2 = iteratorAtPath(complexNodes, [2, 1])!
      expect(iteratorLessThan(iter1, iter2)).toBe(false)
      expect(iteratorLessThan(iter2, iter1)).toBe(false)
    })

    it('compares deeply nested iterators', () => {
      const iter1 = iteratorAtPath(complexNodes, [2, 1, 0, 3])!
      const iter2 = iteratorAtPath(complexNodes, [2, 1, 0, 8])!
      expect(iteratorLessThan(iter1, iter2)).toBe(true)
      expect(iteratorLessThan(iter2, iter1)).toBe(false)
    })

    it('compares iterators with different nesting depths', () => {
      const iter1 = iteratorAtPath(complexNodes, [2, 0])!
      const iter2 = iteratorAtPath(complexNodes, [2, 1, 0, 3])!
      expect(iteratorLessThan(iter1, iter2)).toBe(true)
      expect(iteratorLessThan(iter2, iter1)).toBe(false)
    })
  })

  describe('Edge cases and error conditions', () => {
    it('handles empty nodes array', () => {
      const result = iteratorAtPath([], [0])
      expect(result).toBeUndefined()
    })

    it('handles iterator with undefined children', () => {
      const elementWithoutChildren = createElement('br')
      const iter = createNodeIterator(elementWithoutChildren, 0)
      const node = iteratorsNode(iter)
      expect(node).toBeUndefined()
    })

    it('handles malformed iterators gracefully', () => {
      const malformedIter = { node: undefined as any, index: 0, parent: undefined }
      expect(() => iteratorsPath(malformedIter)).not.toThrow()
      expect(() => iteratorsNode(malformedIter)).not.toThrow()
    })

    it('handles negative indices', () => {
      const iter = createNodeIterator(simpleElement, -1)
      expect(nextSibling(iter)).toBeDefined()
      expect(prevSibling(iter)).toBeUndefined()
    })

    it('handles very large indices', () => {
      const iter = createNodeIterator(simpleElement, 1000)
      expect(nextSibling(iter)).toBeUndefined()
      expect(prevSibling(iter)).toBeDefined()
    })

    it('handles deeply nested structures without issues', () => {
      // Create a simple nested iterator structure
      const parentIter = createNodeIterator(simpleElement, 0)
      const childIter = createNodeIterator(nestedElement, 1, parentIter)
      
      expect(() => iteratorsPath(childIter)).not.toThrow()
      const path = iteratorsPath(childIter)
      expect(path.length).toBe(2) // parent and child
      expect(path).toEqual([0, 1])
    })
  })
})