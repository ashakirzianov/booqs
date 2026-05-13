# CSS Custom Highlight API — Investigation Notes

Evaluated as a replacement for Booqs' current "wrap text nodes in spans" highlight rendering. **Decision: stay with DOM wrapping for now.** Revisit when WebKit ships `highlightsFromPoint`.

## What CHA is

Browser API for styling arbitrary text ranges without DOM mutation. Ranges live in a global registry on the `CSS` namespace; the browser paints the style during layout. No elements created or destroyed.

```js
// CSS (static)
::highlight(booq-yellow) { background-color: #fff59d; }

// JS (per annotation)
const range = new Range();
range.setStart(textNode, 10);
range.setEnd(textNode, 25);

const highlight = new Highlight(range);
CSS.highlights.set('booq-yellow', highlight);
```

A `Highlight` can hold many `Range`s under a single name. Removal is `CSS.highlights.delete(name)`.

**CSS property whitelist:** only properties that don't affect layout are allowed — `color`, `background-color`, `text-decoration`, `text-shadow`, `-webkit-text-fill-color`, `-webkit-text-stroke-color`. The restriction is what makes it fast: paint-only, no re-flow. ~5× faster than DOM wrapping per benchmarks.

**Z-ordering** via `highlight.priority = N` for overlapping ranges.

**Browser support:** Cross-browser Baseline since Firefox 140 (June 2025). Interop 2026 focus area.

## React integration pattern

CHA lives outside React's render model. React owns the DOM; `useEffect` owns the highlight registry. They sit side by side.

```jsx
function BookContent({ nodes, annotations }) {
  const containerRef = useRef(null);
  const rendered = useMemo(() => renderNodes(nodes), [nodes]);

  useEffect(() => {
    if (!containerRef.current || typeof Highlight === 'undefined') return;

    // Bucket by style — one Highlight per color, many ranges each
    const byStyle = new Map();
    for (const ann of annotations) {
      const range = rangeFromBooqPath(containerRef.current, ann.start, ann.end);
      if (!range) continue;
      const bucket = byStyle.get(ann.style) ?? new Highlight();
      bucket.add(range);
      byStyle.set(ann.style, bucket);
    }

    for (const [style, hl] of byStyle) {
      CSS.highlights.set(`booq-${style}`, hl);
    }

    return () => {
      for (const style of byStyle.keys()) {
        CSS.highlights.delete(`booq-${style}`);
      }
    };
  }, [annotations, nodes]);

  return <div ref={containerRef}>{rendered}</div>;
}
```

### Design tensions

**Per-style vs per-annotation bucketing.** Bucketing by style (one Highlight per color, many ranges each) keeps CSS clean and declarative but loses per-annotation click identity. Per-annotation Highlights invert the trade: clean click handling, dynamic `::highlight()` CSS rules.

Better: bucket by style, maintain a parallel `Map<Range, AnnotationId>` in the hook for reverse lookup on click.

**Ref stability.** If the container re-mounts, old Ranges become detached (text nodes are no longer in the document) and highlights silently stop painting. Ranges aren't reactive — they point at specific DOM nodes, not logical positions.

**StrictMode cleanup.** Effect cleanup must delete exactly what it registered, or dev mode will mysteriously drop highlights.

**Global registry.** `CSS.highlights` is document-wide. Name collisions silently overwrite. Prefix with a reader-instance ID if ever nesting readers (preview lists, etc.).

**SSR safety.** `Highlight` and `CSS.highlights` don't exist in Node. Guard with `typeof Highlight === 'undefined'`.

## The blocker: click handling

CHA has no native `event.target` for highlights. The spec explored making Highlights event targets — the MSEdgeExplainers proposed variations — but the approach was dropped due to Web compat risk. `PointerEvent.target` is typed as `Element`, and retargeting to a non-Element breaks existing handlers across the Web.

The compromise was a **query API** instead of an **event-dispatch API**. Less ergonomic, but shippable.

### Option 1: `highlightsFromPoint` (the right answer)

Purpose-built hit-test for CHA:

```js
const hits = CSS.highlights.highlightsFromPoint(x, y);
// returns HighlightHitResult[] with { highlight, ranges }
```

Respects `priority` ordering, ignores obscured highlights, respects `pointer-events` and `touch-action` on containing elements. The browser does native hit-testing; you skip coordinate-to-caret translation entirely.

```js
container.addEventListener('click', (e) => {
  const hits = CSS.highlights.highlightsFromPoint(e.clientX, e.clientY);
  if (hits.length === 0) return;
  const topHit = hits[0];
  // Map back to annotation via the range→annotation reverse lookup
  handleAnnotationClick(topHit, e);
});
```

**Browser support:**
- Chromium (Chrome 135, Edge 140): shipped September 2025
- Firefox: implementation resolved early 2026, in recent builds
- **WebKit (Safari, iOS WKWebView): no signal** ← blocker for Booqs

### Option 2: `caretPositionFromPoint` + manual containment

The fallback path. Maps a coordinate to a DOM position, then check containment against annotation ranges.

```js
function caretFromPoint(x, y) {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    return pos ? { node: pos.offsetNode, offset: pos.offset } : null;
  }
  // WebKit legacy
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    return range ? { node: range.startContainer, offset: range.startOffset } : null;
  }
  return null;
}

const caret = caretFromPoint(e.clientX, e.clientY);
const hit = annotations.find(a => a.range.isPointInRange(caret.node, caret.offset));
```

**Browser support:**
- `caretPositionFromPoint` (standard): Baseline as of December 2025
- `caretRangeFromPoint` (WebKit legacy): older Chrome/Safari

### Why the fallback isn't good enough

`caretPositionFromPoint` is designed for **text editing** — it answers "where would the cursor go if I clicked here to start typing?" That's not the same question as "what did the user visually tap on."

Known gaps:

1. **Padding/margin outside text.** Figure with 40px margin, click 20px below the image. Caret snaps to nearest text position, which may be outside your highlight entirely.

2. **Inter-block whitespace.** Highlight spans two paragraphs with 24px gap between. Click in the gap → inconsistent behavior across browsers. Chrome/Safari/Firefox disagree on which side wins.

3. **End-of-line empty space.** Text ends at column 40, line extends to column 80. Clicks in the empty area have browser-specific behavior.

4. **Floats, absolutely-positioned content.** Clicks on a floated figure's margin area snap unpredictably.

5. **Finger precision on mobile.** A 40×40px fingertip on a 80×20px highlighted word — getting "which highlight" right from a sloppy tap needs radius-based hit-testing, not point-based. Not provided by any browser API.

### The hybrid workaround

Combine caret-based (precise for text) and element-based (bounding-box for non-text):

```js
function findHighlightAt(x, y) {
  // 1. Caret-based for text
  const caret = caretFromPoint(x, y);
  if (caret) {
    const hit = annotations.find(a => a.range.isPointInRange(caret.node, caret.offset));
    if (hit) return hit;
  }

  // 2. Element-based for whitespace, images, figures
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    const hit = annotations.find(a => a.range.intersectsNode(el));
    if (hit) return hit;
  }

  return null;
}
```

This approximates DOM wrapping's bounding-box hit-testing but reimplements what the browser does for free with wrapped spans. Two-phase hit-testing with inconsistent cross-browser behavior is a bug factory.

## Why DOM wrapping wins for Booqs today

- **Universal** across every browser and WebView, historical and current
- **`event.target.dataset.annotationId`** — instant ID lookup via standard DOM events
- **Bounding-box hit-testing** — CSS padding on the span = trivial click slack on touch
- **Accessibility tooling sees structure** — screen readers, find-in-page, devtools inspector all work naturally
- **Selection and copy semantics** work without reimplementation
- **Already working** in the Booqs codebase

The value proposition of CHA ("no DOM mutation, fast paint, native") is real, but it only lands cleanly when paired with `highlightsFromPoint`. Without that, the integration work on the WebKit path (caret-based fallback with known holes, or hybrid two-phase hit-testing) erases the simplicity win entirely.

## Mobile UX considerations (for any highlight system)

Independent of rendering mechanism:

**Tap vs. selection ambiguity.** On touch, tapping in text often triggers native selection UI. If a user taps a highlight, you want "open note"; the OS may want "start selection." Options:
- `user-select: none` + implement selection manually (heavy, breaks accessibility, is what Readium does)
- Timer-based distinction: short tap (<500ms) = open note, long-press = start selection
- Accept ambiguity: clicks on highlights open notes, to select highlighted text user must start selection from outside the highlight (Kindle's approach)

**Finger precision.** Add ~20px radius hit-slack — if direct hit-test returns nothing, check 4–8 points around the click, return closest match. Cheap, dramatically improves perceived precision.

## Interesting dead ends

**`HighlightPointerEvent`** — was in the MSEdgeExplainers, would have extended `PointerEvent` with highlight-typed target. Dropped from the CSSWG in favor of `highlightsFromPoint`. If you see references in old explainers, that's what it was.

**`::highlight:hover`** — pseudo-classes on highlight pseudo-elements. Requested feature, not in the spec yet.

## Revisit trigger

Watch WebKit standards position on `highlightsFromPoint`:
https://github.com/WebKit/standards-positions

If Safari signals positive and ships it, CHA becomes Baseline-ish for reader use cases. Migration at that point is ~1–2 weeks of work:
- Replace span-wrapping render step with `CSS.highlights.set()` calls
- Replace `event.target.dataset` click handler with `highlightsFromPoint` + range-to-annotation reverse lookup
- Keep DOM wrapping path as feature-detected fallback for older WebViews

Locator schema and healing logic are **orthogonal** to rendering mechanism — no changes required there.

## Summary

| Aspect | DOM wrapping | CHA (today) | CHA (post-WebKit) |
|---|---|---|---|
| Paint performance | Baseline | ~5× faster | ~5× faster |
| DOM mutation | Yes | No | No |
| Click handling | `event.target` (free) | caret + hybrid (lossy) | `highlightsFromPoint` (native) |
| Accessibility | Native | Requires ARIA overlay | Requires ARIA overlay |
| Selection/copy | Native | Native | Native |
| Cross-browser | Universal | Baseline + WebKit gap | Baseline |
| Integration complexity | Low | High | Medium |

DOM wrapping is the right choice for Booqs right now. CHA becomes the right choice when WebKit ships `highlightsFromPoint`.

## See also

- [booqs-locator-design.md](booqs-locator-design.md) — locator and annotation design that references this investigation.
- [css-handling.md](css-handling.md) — EPUB CSS containment strategy.
- [../../docs/roadmap.md](../../docs/roadmap.md) — "Technical decisions standing" records the Highlights rendering commitment.
