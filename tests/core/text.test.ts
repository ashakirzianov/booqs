import {
  nodeText,
  nodesText,
  previewForPath,
  contextForRange,
  contextForPath,
  getQuoteAndContext,
  textForRange,
} from '../../core/text'
import { BooqNode, BooqElementNode, BooqTextNode, BooqRange } from '../../core/model'

describe('core/text', () => {
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

  describe('nodeText', () => {
    it('returns content for text nodes', () => {
      expect(nodeText(simpleTextNode)).toBe('Hello World')
    })

    it('returns empty string for stub nodes', () => {
      expect(nodeText(stubNode)).toBe('')
    })

    it('returns empty string for null nodes', () => {
      expect(nodeText(nullNode)).toBe('')
    })

    it('returns empty string for undefined nodes', () => {
      expect(nodeText(undefined as any)).toBe('')
    })

    it('returns concatenated text for element nodes', () => {
      expect(nodeText(simpleElement)).toBe('First Second')
    })

    it('returns concatenated text for nested element nodes', () => {
      expect(nodeText(nestedElement)).toBe('Nested text Middle Emphasized')
    })

    it('handles element with no children', () => {
      const emptyElement = createElement('br')
      expect(nodeText(emptyElement)).toBe('')
    })

    it('handles empty children array', () => {
      const elementWithEmptyChildren = createElement('div', [])
      expect(nodeText(elementWithEmptyChildren)).toBe('')
    })

    it('handles mixed children with nulls and stubs', () => {
      const mixedElement = createElement('div', [
        createTextNode('Start '),
        nullNode,
        stubNode,
        createTextNode(' End'),
      ])
      expect(nodeText(mixedElement)).toBe('Start  End')
    })
  })

  describe('nodesText', () => {
    it('returns empty string for empty array', () => {
      expect(nodesText([])).toBe('')
    })

    it('returns text for single text node', () => {
      expect(nodesText([createTextNode('Single')])).toBe('Single')
    })

    it('returns concatenated text for multiple text nodes', () => {
      expect(nodesText([
        createTextNode('First '),
        createTextNode('Second '),
        createTextNode('Third'),
      ])).toBe('First Second Third')
    })

    it('returns concatenated text for mixed node types', () => {
      expect(nodesText([
        createTextNode('Text '),
        simpleElement,
        createTextNode(' More'),
      ])).toBe('Text First Second More')
    })

    it('handles array with nulls and stubs', () => {
      expect(nodesText([
        createTextNode('Start '),
        nullNode,
        stubNode,
        createTextNode(' End'),
      ])).toBe('Start  End')
    })
  })

  describe('previewForPath', () => {
    it('returns preview text from specified path', () => {
      const result = previewForPath(complexNodes, [0, 0], 20)
      expect(result).toBe('Paragraph one.Root text.')
    })

    it('returns undefined for invalid path', () => {
      const result = previewForPath(complexNodes, [10], 20)
      expect(result).toBeUndefined()
    })

    it('returns minimum length preview including full last node', () => {
      const result = previewForPath(complexNodes, [1], 5)
      expect(result).toBe('Root text.')
    })

    it('continues to next leaves when length not reached', () => {
      const result = previewForPath(complexNodes, [2, 0], 30)
      expect(result).toBe('Div start Span content Div end')
    })

    it('handles path to non-text node', () => {
      const result = previewForPath(complexNodes, [2], 20)
      expect(result).toBe('Div start Span content')
    })

    it('returns empty string when no text content found', () => {
      const emptyNodes = [createElement('div', [createElement('br')])]
      const result = previewForPath(emptyNodes, [0], 10)
      expect(result).toBe('')
    })

    it('handles whitespace-only content', () => {
      const whitespaceNodes = [createTextNode('   \n\t   '), createTextNode('Text')]
      const result = previewForPath(whitespaceNodes, [0], 10)
      expect(result).toBe('Text')
    })
  })

  describe('contextForRange', () => {
    it('delegates to contextForPath with start path', () => {
      const range: BooqRange = { start: [1], end: [2] }
      const result = contextForRange(complexNodes, range, 20)
      const expectedResult = contextForPath(complexNodes, [1], 20)
      expect(result).toBe(expectedResult)
    })

    it('currently ignores end parameter (implementation note)', () => {
      const range1: BooqRange = { start: [1], end: [2] }
      const range2: BooqRange = { start: [1], end: [3] }
      const result1 = contextForRange(complexNodes, range1, 20)
      const result2 = contextForRange(complexNodes, range2, 20)
      expect(result1).toBe(result2)
    })
  })

  describe('contextForPath', () => {
    it('returns context around specified path', () => {
      const result = contextForPath(complexNodes, [1], 50)
      expect(result).toContain('Root text.')
      expect(result).toContain('Paragraph one.')
    })

    it('returns undefined for invalid path', () => {
      const result = contextForPath(complexNodes, [10], 20)
      expect(result).toBeUndefined()
    })

    it('limits result to specified length', () => {
      const result = contextForPath(complexNodes, [1], 10)
      expect(result?.length).toBeLessThanOrEqual(10)
    })

    it('builds context from both directions', () => {
      const result = contextForPath(complexNodes, [2, 1, 0], 100)
      expect(result).toContain('Span content')
      expect(result).toContain('Div start')
      expect(result).toContain('Root text')
    })

    it('handles length constraints correctly', () => {
      const result = contextForPath(complexNodes, [1], 5)
      expect(result).toBeDefined()
      expect(result!.length).toBe(5)
    })

    it('returns empty string when no context available', () => {
      const singleNode = [createTextNode('Only')]
      const result = contextForPath(singleNode, [0], 20)
      expect(result).toBe('Only')
    })
  })

  describe('getQuoteAndContext', () => {
    const testRange: BooqRange = { start: [1], end: [2] }

    it('returns quote and context for valid range', () => {
      const result = getQuoteAndContext(complexNodes, testRange, 20)
      expect(result).toHaveProperty('quote')
      expect(result).toHaveProperty('contextBefore')
      expect(result).toHaveProperty('contextAfter')
      expect(typeof result.quote).toBe('string')
      expect(typeof result.contextBefore).toBe('string')
      expect(typeof result.contextAfter).toBe('string')
    })

    it('returns empty quote for invalid range', () => {
      const invalidRange: BooqRange = { start: [10], end: [11] }
      const result = getQuoteAndContext(complexNodes, invalidRange, 20)
      expect(result.quote).toBe('')
      expect(result.contextBefore).toBe('')
      expect(result.contextAfter).toBe('')
    })

    it('builds context before the range', () => {
      const range: BooqRange = { start: [2, 0], end: [2, 1] }
      const result = getQuoteAndContext(complexNodes, range, 50)
      expect(result.contextBefore).toContain('Root text')
    })

    it('builds context after the range', () => {
      const range: BooqRange = { start: [1], end: [2, 0] }
      const result = getQuoteAndContext(complexNodes, range, 50)
      expect(result.contextAfter).toContain('Span content')
    })

    it('respects node boundaries and includes full last node in context', () => {
      const result = getQuoteAndContext(complexNodes, testRange, 5)
      // Context includes full content of last node even if it exceeds minimum length
      expect(result.contextBefore.length).toBeGreaterThanOrEqual(5)
      expect(result.contextAfter.length).toBeGreaterThanOrEqual(5)
    })

    it('handles range with start pointing to character within text node', () => {
      // Range starting at character 3 in "Paragraph one." ending at node [1] (Root text)
      const range: BooqRange = { start: [0, 0, 3], end: [1] }
      const result = getQuoteAndContext(complexNodes, range, 20)
      expect(result.quote).toBe('agraph one.')
      expect(result.contextBefore).toBe('')
      expect(result.contextAfter).toBe('Div start Span content')
    })

    it('handles range with end pointing to character within text node', () => {
      // Range starting at node [1] ending at character 4 in "Root text. "
      const range: BooqRange = { start: [1], end: [1, 4] }
      const result = getQuoteAndContext(complexNodes, range, 20)
      expect(result.quote).toBe('Root')
      expect(result.contextBefore).toBe('Paragraph one.')
      expect(result.contextAfter).toBe('Div start Span content')
    })

    it('handles range with both start and end pointing to characters within same text node', () => {
      // Range within "Paragraph one." from character 4 to 7
      const range: BooqRange = { start: [0, 0, 4], end: [0, 0, 7] }
      const result = getQuoteAndContext(complexNodes, range, 20)
      expect(result.quote).toBe('gra')
      expect(result.contextBefore).toBe('')
      expect(result.contextAfter).toBe('Root text. Div start ')
    })

    it('handles range with both start and end pointing to characters within different text nodes', () => {
      // Range from character 5 in "Paragraph one." to character 4 in "Root text. "
      const range: BooqRange = { start: [0, 0, 5], end: [1, 4] }
      const result = getQuoteAndContext(complexNodes, range, 30)
      expect(result.quote).toBe('raph one.Root')
      expect(result.contextBefore).toBe('')
      expect(result.contextAfter).toBe('Div start Span content Div end')
    })

    it('handles range with start pointing to character within nested text node', () => {
      // Range starting at character 2 in "Span content" ending at node [2, 2] (Div end)
      const range: BooqRange = { start: [2, 1, 0, 2], end: [2, 2] }
      const result = getQuoteAndContext(complexNodes, range, 25)
      expect(result.quote).toBe('an content')
      expect(result.contextBefore).toBe('Div start Sp')
      expect(result.contextAfter).toBe(' Final text.')
    })

    it('handles range with end pointing to character within nested text node', () => {
      // Range starting at node [2, 0] ending at character 3 in "Span content"
      const range: BooqRange = { start: [2, 0], end: [2, 1, 0, 3] }
      const result = getQuoteAndContext(complexNodes, range, 25)
      expect(result.quote).toBe('Div start Spa')
      expect(result.contextBefore).toBe('Paragraph one.Root text. ')
      expect(result.contextAfter).toBe('n content Div end Final')
    })
  })

  describe('textForRange', () => {
    it('returns text for simple range within single text node', () => {
      const nodes = [createTextNode('Hello World')]
      const range: BooqRange = { start: [0, 0], end: [0, 5] }
      const result = textForRange(nodes, range)
      expect(result).toBe('Hello')
    })

    it('returns text for character range within nested text node', () => {
      const range: BooqRange = { start: [0, 0, 3], end: [0, 0, 8] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('agrap')
    })

    it('returns text for character range within deeply nested text node', () => {
      const range: BooqRange = { start: [2, 1, 0, 1], end: [2, 1, 0, 5] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('pan ')
    })

    it('returns text for range spanning multiple nodes', () => {
      const range: BooqRange = { start: [0, 0], end: [2, 0] }
      const result = textForRange(complexNodes, range)
      expect(result).toContain('Paragraph one.')
      expect(result).toContain('Root text.')
    })

    it('returns undefined for invalid start index', () => {
      const range: BooqRange = { start: [10], end: [11] }
      const result = textForRange(complexNodes, range)
      expect(result).toBeUndefined()
    })

    it('returns undefined for invalid end index', () => {
      const range: BooqRange = { start: [0], end: [10] }
      const result = textForRange(complexNodes, range)
      expect(result).toBeUndefined()
    })

    it('returns undefined when start > end', () => {
      const range: BooqRange = { start: [2], end: [1] }
      const result = textForRange(complexNodes, range)
      expect(result).toBeUndefined()
    })

    it('handles range within nested element', () => {
      const range: BooqRange = { start: [2, 1, 0, 0], end: [2, 1, 0, 4] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('Span')
    })

    it('handles range starting and ending in same node', () => {
      const range: BooqRange = { start: [1, 0], end: [1, 4] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('Root')
    })

    it('returns full text content when no character positions specified', () => {
      const range: BooqRange = { start: [1], end: [2] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('Root text. ')
    })

    it('handles element nodes in range with exclusive end', () => {
      const range: BooqRange = { start: [2], end: [3] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('Div start Span content Div end')
    })

    it('returns undefined for text node with invalid path extension', () => {
      const nodes = [createTextNode('Test')]
      const range: BooqRange = { start: [0, 0, 0], end: [0, 0, 1] }
      const result = textForRange(nodes, range)
      expect(result).toBeUndefined()
    })

    it('handles complex nested ranges with exclusive end', () => {
      const deepNodes = [
        createElement('div', [
          createElement('p', [
            createTextNode('First '),
            createElement('span', [createTextNode('nested')]),
            createTextNode(' last'),
          ]),
        ]),
      ]
      const range: BooqRange = { start: [0, 0, 1, 0, 1], end: [0, 0, 2, 3] }
      const result = textForRange(deepNodes, range)
      expect(result).toBe('ested la')
    })

    it('returns empty string for empty range', () => {
      const range: BooqRange = { start: [1, 5], end: [1, 5] }
      const result = textForRange(complexNodes, range)
      expect(result).toBe('')
    })

    it('handles stub nodes in range', () => {
      const nodesWithStub = [
        createTextNode('Before '),
        stubNode,
        createTextNode(' After'),
      ]
      const range: BooqRange = { start: [0], end: [2] }
      const result = textForRange(nodesWithStub, range)
      expect(result).toBe('Before ')
    })
  })

  describe('edge cases and error conditions', () => {
    it('handles empty nodes array', () => {
      expect(nodesText([])).toBe('')
      expect(previewForPath([], [0], 10)).toBeUndefined()
      expect(contextForPath([], [0], 10)).toBeUndefined()
    })

    it('handles malformed ranges', () => {
      const range: BooqRange = { start: [], end: [] }
      expect(textForRange(complexNodes, range)).toBeUndefined()

      const invalidRange: BooqRange = { start: [-1], end: [0] }
      expect(textForRange(complexNodes, invalidRange)).toBeUndefined()
    })

    it('handles nodes with undefined content', () => {
      const nodeWithUndefinedContent: any = { kind: 'text', content: undefined }
      expect(() => nodeText(nodeWithUndefinedContent)).not.toThrow()
    })

    it('handles deeply nested structures', () => {
      const deeplyNested = createElement('div', [
        createElement('p', [
          createElement('span', [
            createElement('em', [
              createTextNode('Deep content'),
            ]),
          ]),
        ]),
      ])
      expect(nodeText(deeplyNested)).toBe('Deep content')
    })
  })
})