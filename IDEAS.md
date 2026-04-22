### Big Model Migration
- New annotations model:
    * BooqLocator with CFI-compatible path and suffix/prefix/target text
    * No "highlight-N" nonsense -- use a separate color field
    * New table "annotations"
    * Rename Note -> Annotation?
- Bring BooqNode even closer to epub
    * Use parsed xml nodes directly
    * Consider swithcing to @scope client-side for css isolation instead of pre-processing server-side
    * Extend for section/documents
    * Rethink how do we preprocess content
        * Maybe instead of subtly modifying content we can extract all the information necessary for clients to easily resolve on rendering?

### Collections
- Fix: uploaded books do not appear on the collections page. Neither does reading list books
- We should also add "Currently reading" collection for all books in the reading history
- Major change: the screen should be called "Library" and should live on /library route:
    * Instead of showing multiple sections for "Uploaded", "Reading List", "Currently Reading", we should present user with a filter options: "All", "Uploaded", etc.
    * we might need extra endpoints/graphql queries to facilitate this change

### Notes
- We need to support pagination + infinite scroll for notes
- Instead of a redirect from /notes to /notes/{booqId} we need to support "all notes for all books" page that displays all notes for all books.
- Consider markdown support in notes content
- booqsWithNotes should support pagination and should return booqs in order of recency of notes (booqs with the most recent note comes first) in both RESP api and graphql endpoint
- Perhaps book notes should live under /booq/[id]/notes route and all notes should live under /notes/all route? Then /notes/[id] could be reserved for individual note

### Replies:
- Allow author to remove replies under their question
- Support separate "generate reply" button to generate replies under own questions if the generated reply is missing

### AI:
- Usage counter for AI features
- Rethink AI prompts (it seems like it artificially limits the responses)

### Auth:
- We need to better understand and document shortcomings of our current token rotation model. Some issues worth discussing:
    * Concurrency with rotating refresh tokens -- what happens if we have multiple concurent requests with expired access token? How should we handle it? This scenario is rare in practice for our app, but not impossible.
    * Currently we send both tokens in cookies on every request. That somewhat limits utility of dual-token approach: now refresh token has same exposure surface as access token in a sense that it could leak through logging etc. Can we do better?

### SwiftUI App Integration:
- Add /.well-known/apple-app-site-association
- Possible work to be done to support passkey auth for native apps

### Search:
- Improve search:
    * Search for "republic" should definetely find "The Republic"
    * "republic plator" should also find that book

### Security:
- We should address image processing security vulnerabilities

### Rendering
- Consider use new CSS Highlight API for rendering annotations:
    * Current limitation: highlightsFromPoint API is not supported by Safari and without it handling highligh clicks is hacky (need to rely on caretPositionFromPoint and DOM-to-augmentation resolution)

### Reader
- Infinite scroll
- Page view rendering

### Feature Ideas
- Design "feed" feature
- Mark as finished feature
    * should support editing of the date finished
- Reading goals feature
    * Books per year
    * Minutes per day (with streaks and notifications?)
- Journaling feature (complex)
    * Prompt questions after each chapter
    * Skip feature for this book or disable entirely (make sure to let know how to re-enable)
    * Remind to answer question later
    * Highlights-based prompting?
    * AI-generated questions and user-generated questions
    * Up/down voting per-question
    * How are we going to design journaling -- as a special kind of note? As a separate entity?
- Comments up/down voting
- Language-aware AI features

### Misc
- We should document non-obvious graphql schema entries (queries, mutations, types, returns etc.)
- Cookies
    * We should remove google analytics?
    * We should remove vercel speed insights after we improve performance?
