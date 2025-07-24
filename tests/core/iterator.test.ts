import {
  BooqNodeIterator,
  iteratorsNode,
  iteratorsPath,
  rootIterator,
  firstLeaf,
  lastLeaf,
  findPath,
  nextSibling,
  prevSibling,
  nextNode,
  prevNode,
  nextLeaf,
  prevLeaf,
} from '../../core/iterator'
import { BooqNode, BooqElementNode, BooqTextNode } from '../../core/model'

describe('core/iterator', () => {
  // Test data setup
  const createTextNode = (content: string): BooqTextNode => ({
    kind: 'text',
    content,
  })

  const createElement = (name: string, children?: BooqNode[]): BooqElementNode => ({
    kind: 'element',
    name,
    children,
  })

  // Simple flat structure
  const flatNodes: BooqNode[] = [
    createTextNode('First'),
    createTextNode('Second'),
    createTextNode('Third'),
  ]

  // Nested structure
  const nestedNodes: BooqNode[] = [
    createElement('div', [
      createTextNode('Child 1'),
      createElement('span', [createTextNode('Nested text')]),
      createTextNode('Child 2'),
    ]),
    createTextNode('Root text'),
    createElement('p', [createTextNode('Paragraph text')]),
  ]

  describe('iteratorsNode', () => {
    it('returns the current node at iterator index', () => {
      const iter = rootIterator(flatNodes)
      expect(iteratorsNode(iter)).toEqual(createTextNode('First'))
    })

    it('returns the correct node when index is changed', () => {
      const iter = { ...rootIterator(flatNodes), index: 1 }
      expect(iteratorsNode(iter)).toEqual(createTextNode('Second'))
    })
  })

  describe('iteratorsPath', () => {
    it('returns path for root level iterator', () => {
      const iter = { ...rootIterator(flatNodes), index: 1 }
      expect(iteratorsPath(iter)).toEqual([1])
    })

    it('returns nested path for child iterator', () => {
      const rootIter = rootIterator(nestedNodes)
      const childIter: BooqNodeIterator = {
        parent: rootIter,
        nodes: (nestedNodes[0] as BooqElementNode).children!,
        index: 1,
      }
      expect(iteratorsPath(childIter)).toEqual([0, 1])
    })

    it('returns deeply nested path', () => {
      const rootIter = rootIterator(nestedNodes)
      const divIter: BooqNodeIterator = {
        parent: rootIter,
        nodes: (nestedNodes[0] as BooqElementNode).children!,
        index: 1,
      }
      const spanChildren = ((nestedNodes[0] as BooqElementNode).children![1] as BooqElementNode).children!
      const spanIter: BooqNodeIterator = {
        parent: divIter,
        nodes: spanChildren,
        index: 0,
      }
      expect(iteratorsPath(spanIter)).toEqual([0, 1, 0])
    })
  })

  describe('rootIterator', () => {
    it('creates iterator at index 0 with no parent', () => {
      const iter = rootIterator(flatNodes)
      expect(iter).toEqual({
        nodes: flatNodes,
        index: 0,
        parent: undefined,
      })
    })
  })

  describe('firstLeaf', () => {
    it('returns same iterator for text node', () => {
      const iter = { ...rootIterator(flatNodes), index: 0 }
      const leaf = firstLeaf(iter)
      expect(leaf).toEqual(iter)
      expect(iteratorsNode(leaf)).toEqual(createTextNode('First'))
    })

    it('returns first text child for element node', () => {
      const iter = rootIterator(nestedNodes)
      const leaf = firstLeaf(iter)
      expect(iteratorsPath(leaf)).toEqual([0, 0])
      expect(iteratorsNode(leaf)).toEqual(createTextNode('Child 1'))
    })

    it('returns deeply nested first leaf', () => {
      const deepNodes: BooqNode[] = [
        createElement('div', [
          createElement('span', [
            createElement('em', [createTextNode('Deep text')])
          ])
        ])
      ]
      const iter = rootIterator(deepNodes)
      const leaf = firstLeaf(iter)
      expect(iteratorsPath(leaf)).toEqual([0, 0, 0, 0])
      expect(iteratorsNode(leaf)).toEqual(createTextNode('Deep text'))
    })

    it('returns element iterator if element has no children', () => {
      const emptyElement = createElement('br')
      const iter = rootIterator([emptyElement])
      const leaf = firstLeaf(iter)
      expect(leaf).toEqual(iter)
      expect(iteratorsNode(leaf)).toEqual(emptyElement)
    })
  })

  describe('lastLeaf', () => {
    it('returns same iterator for text node', () => {
      const iter = { ...rootIterator(flatNodes), index: 2 }
      const leaf = lastLeaf(iter)
      expect(leaf).toEqual(iter)
      expect(iteratorsNode(leaf)).toEqual(createTextNode('Third'))
    })

    it('returns last text child for element node', () => {
      const iter = rootIterator(nestedNodes)
      const leaf = lastLeaf(iter)
      expect(iteratorsPath(leaf)).toEqual([0, 2])
      expect(iteratorsNode(leaf)).toEqual(createTextNode('Child 2'))
    })

    it('returns deeply nested last leaf', () => {
      const deepNodes: BooqNode[] = [
        createElement('div', [
          createElement('span', [createTextNode('First')]),
          createElement('p', [
            createElement('em', [createTextNode('Last deep text')])
          ])
        ])
      ]
      const iter = rootIterator(deepNodes)
      const leaf = lastLeaf(iter)
      expect(iteratorsPath(leaf)).toEqual([0, 1, 0, 0])
      expect(iteratorsNode(leaf)).toEqual(createTextNode('Last deep text'))
    })
  })

  describe('findPath', () => {
    it('finds root level node', () => {
      const iter = rootIterator(flatNodes)
      const found = findPath(iter, [1])
      expect(found).toBeDefined()
      expect(found!.index).toBe(1)
      expect(iteratorsNode(found!)).toEqual(createTextNode('Second'))
    })

    it('finds nested node', () => {
      const iter = rootIterator(nestedNodes)
      const found = findPath(iter, [0, 1])
      expect(found).toBeDefined()
      expect(iteratorsPath(found!)).toEqual([0, 1])
    })

    it('finds deeply nested node', () => {
      const iter = rootIterator(nestedNodes)
      const found = findPath(iter, [0, 1, 0])
      expect(found).toBeDefined()
      expect(iteratorsPath(found!)).toEqual([0, 1, 0])
      expect(iteratorsNode(found!)).toEqual(createTextNode('Nested text'))
    })

    it('returns undefined for invalid path', () => {
      const iter = rootIterator(flatNodes)
      expect(findPath(iter, [5])).toBeUndefined()
      
      // For text nodes with path extension beyond 1 level, it should return undefined
      expect(findPath(iter, [0, 0, 0])).toBeUndefined()
    })

    it('handles text node with path extension', () => {
      const iter = rootIterator(flatNodes)
      const found = findPath(iter, [0, 1]) // text node with position
      expect(found).toBeDefined()
      expect(found!.index).toBe(0)
    })

    it('returns undefined for empty path', () => {
      const iter = rootIterator(flatNodes)
      const found = findPath(iter, [])
      expect(found).toBeUndefined()
    })
  })

  describe('nextSibling', () => {
    it('returns next sibling when available', () => {
      const iter = rootIterator(flatNodes)
      const next = nextSibling(iter)
      expect(next).toBeDefined()
      expect(next!.index).toBe(1)
      expect(iteratorsNode(next!)).toEqual(createTextNode('Second'))
    })

    it('returns undefined when at last sibling', () => {
      const iter = { ...rootIterator(flatNodes), index: 2 }
      const next = nextSibling(iter)
      expect(next).toBeUndefined()
    })
  })

  describe('prevSibling', () => {
    it('returns previous sibling when available', () => {
      const iter = { ...rootIterator(flatNodes), index: 1 }
      const prev = prevSibling(iter)
      expect(prev).toBeDefined()
      expect(prev!.index).toBe(0)
      expect(iteratorsNode(prev!)).toEqual(createTextNode('First'))
    })

    it('returns undefined when at first sibling', () => {
      const iter = rootIterator(flatNodes)
      const prev = prevSibling(iter)
      expect(prev).toBeUndefined()
    })
  })

  describe('nextNode', () => {
    it('returns next sibling when available', () => {
      const iter = rootIterator(flatNodes)
      const next = nextNode(iter)
      expect(next).toBeDefined()
      expect(next!.index).toBe(1)
    })

    it('returns parent next sibling when no sibling available', () => {
      const rootIter = rootIterator(nestedNodes)
      const childIter: BooqNodeIterator = {
        parent: rootIter,
        nodes: (nestedNodes[0] as BooqElementNode).children!,
        index: 2, // last child
      }
      const next = nextNode(childIter)
      expect(next).toBeDefined()
      expect(iteratorsPath(next!)).toEqual([1])
      expect(iteratorsNode(next!)).toEqual(createTextNode('Root text'))
    })

    it('returns undefined when no next node exists', () => {
      const iter = { ...rootIterator(flatNodes), index: 2 }
      const next = nextNode(iter)
      expect(next).toBeUndefined()
    })
  })

  describe('prevNode', () => {
    it('returns previous sibling when available', () => {
      const iter = { ...rootIterator(flatNodes), index: 1 }
      const prev = prevNode(iter)
      expect(prev).toBeDefined()
      expect(prev!.index).toBe(0)
    })

    it('returns parent previous sibling when no sibling available', () => {
      const rootIter = { ...rootIterator(nestedNodes), index: 1 }
      const childIter: BooqNodeIterator = {
        parent: rootIter,
        nodes: (nestedNodes[2] as BooqElementNode).children!,
        index: 0,
      }
      const prev = prevNode(childIter)
      expect(prev).toBeDefined()
      expect(iteratorsPath(prev!)).toEqual([0])
    })

    it('returns undefined when no previous node exists', () => {
      const iter = rootIterator(flatNodes)
      const prev = prevNode(iter)
      expect(prev).toBeUndefined()
    })
  })

  describe('nextLeaf', () => {
    it('returns first leaf of next node', () => {
      const iter = { ...rootIterator(nestedNodes), index: 1 } // 'Root text'
      const nextL = nextLeaf(iter)
      expect(nextL).toBeDefined()
      expect(iteratorsPath(nextL!)).toEqual([2, 0])
      expect(iteratorsNode(nextL!)).toEqual(createTextNode('Paragraph text'))
    })

    it('returns undefined when no next leaf exists', () => {
      const iter = { ...rootIterator(flatNodes), index: 2 }
      const nextL = nextLeaf(iter)
      expect(nextL).toBeUndefined()
    })
  })

  describe('prevLeaf', () => {
    it('returns last leaf of previous node', () => {
      const iter = { ...rootIterator(nestedNodes), index: 1 } // 'Root text'
      const prevL = prevLeaf(iter)
      expect(prevL).toBeDefined()
      expect(iteratorsPath(prevL!)).toEqual([0, 2])
      expect(iteratorsNode(prevL!)).toEqual(createTextNode('Child 2'))
    })

    it('returns undefined when no previous leaf exists', () => {
      const iter = rootIterator(flatNodes)
      const prevL = prevLeaf(iter)
      expect(prevL).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty node arrays', () => {
      const iter = rootIterator([])
      expect(() => iteratorsNode(iter)).not.toThrow()
      expect(iteratorsNode(iter)).toBeUndefined()
    })

    it('handles null nodes', () => {
      const nodesWithNull: BooqNode[] = [null, createTextNode('text')]
      const iter = rootIterator(nodesWithNull)
      expect(iteratorsNode(iter)).toBeNull()
    })

    it('handles stub nodes', () => {
      const stubNode: BooqNode = { kind: 'stub', length: 10 }
      const iter = rootIterator([stubNode])
      expect(iteratorsNode(iter)).toEqual(stubNode)
      expect(firstLeaf(iter)).toEqual(iter)
    })
  })
})