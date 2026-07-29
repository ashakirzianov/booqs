# Native API Access Under Vercel Bot Protection — Design

> Proposal for exempting the native SwiftUI app's traffic from Vercel's
> challenge-based protection while keeping the protection's value for
> everything else. Production runs challenge/bot-protection deliberately;
> the native app cannot pass a browser JavaScript challenge, so Release
> builds cannot reach the API at all. This doc delivers the mechanism
> facts (cited to current Vercel docs), the option space with costs, a
> recommendation, a dashboard checklist, and a future implementation plan.
> **The decision is Anton's; nothing here changes production config, code,
> or secrets. No secret values appear in this doc — placeholders only.**
>
> Status: **direction set — Option B first** (Anton's review, 2026-07-29):
> path-scoped bypass now, Option A held as the pre-designed escalation on
> evidence of GraphQL abuse. §8–§10 revised accordingly. Dashboard
> execution pending (§9).

## 1. The problem and the evidence

Production (`www.booqs.app`, Vercel) answers the native app's GraphQL
POSTs with the Vercel Security Checkpoint — HTTP 429 or an HTML challenge
page instead of JSON. Recorded evidence, both from the first on-device
run (2026-07-28):

- swiftui-app `docs/pitfalls.md` § Backend Environment: rapid-fire
  requests trigger the checkpoint (429 / HTML challenge instead of
  GraphQL JSON); on the device run the checkpoint answered the app's own
  on-device GraphQL POSTs and **persisted through two multi-minute
  cool-downs**. In-app it surfaces as `serverError(statusCode: 429)` or
  `invalidResponse` (HTML fails JSON decode).
- swiftui-app `docs/quire-integration.md` §7 (device verification):
  "production answered the device's GraphQL with the Vercel checkpoint
  (429) throughout the session" — the whole session ran against the
  Mac's dev server instead.

Vercel's own docs confirm this is by design, not a bug: a challenge
"verifies that incoming traffic originates from a real web browser with
JavaScript capabilities"; "Direct API calls (e.g., from scripts, cURL, or
Postman) will fail if they require challenge validation"; "Automated
tools and scripts cannot establish challenge sessions. For legitimate
automation needs, use Bypass" ([Firewall concepts][concepts],
last_updated 2026-06-16). The Attack Mode page says the same about
non-browser clients: "Standalone APIs, other backend frameworks, and
non-recognized automated services may not be able to pass challenges and
could be blocked" ([Attack Mode][attack-mode], 2026-05-08).

Consequence: **DEBUG builds work only against the Mac's dev server;
Release builds have no working API at all.** This blocks TestFlight and
any App Store path.

## 2. What is actually challenging the traffic

Three distinct Vercel layers can produce the observed 429/checkpoint.
Which one(s) are enabled is a dashboard fact this repo cannot see —
**unverified; step 1 of the checklist (§9) is to look**:

1. **Bot protection managed ruleset** (Firewall → Bot Management) —
   challenges "non-browser traffic"; **inactive by default**, so if it's
   on, it was turned on deliberately — consistent with the ruling's
   premise. Vercel documents the exact escape hatch: "For trusted
   automated traffic, you can create custom WAF rules with bypass
   actions that will allow this traffic to skip the bot protection
   ruleset" ([Bot Management][bot-mgmt], 2026-07-09).
2. **Attack Mode** — challenges *all* non-verified-bot traffic; free on
   all plans; intended for active-attack periods but safe to leave on
   ([Attack Mode][attack-mode]).
3. **Platform DDoS mitigation** — automatic, always on, burst-triggered
   (the "rapid-fire curl" observations fit this layer). Not configurable
   and not something we want to exempt anyone from; a well-behaved
   native client stays under it.

The persistent (non-burst) device-run failures point at 1 and/or 2. The
design below works for both: the same custom-rule bypass mechanism is
Vercel's documented answer in each case. The bypass-vs-Attack-Mode
interaction specifically is stated less explicitly in the docs than for
the bot-protection ruleset (the Attack Mode page says custom rules give
"more control over what traffic is challenged" without spelling out the
bypass action) — **flagged unverified; the log-mode test in §9 settles
it empirically in minutes either way**.

## 3. What the native client's traffic looks like today

From the swiftui-app source (read-only; file references for the future
implementation):

- **GraphQL**: `POST /api/graphql`, `Content-Type: application/json`;
  authenticated operations add `X-Access-Token` (header-based, no
  cookies); subscriptions are the same POST with
  `Accept: text/event-stream` (SSE) — `Booqs/Network/GraphQLClient.swift`
  (`makeRequest` / `authorizedRequest`).
- **No custom User-Agent** — requests carry the URLSession default
  (`<app-name>/<build> CFNetwork/<v> Darwin/<v>` form).
- **No `Origin` header** (URLSession doesn't send one), so the GraphQL
  route's origin allowlist passes it (`app/api/graphql/route.ts` 403s
  only when an Origin is present and not allowlisted), and this repo's
  `proxy.ts` UA bot filter doesn't match the CFNetwork UA either. **The
  app-level stack needs no change — the block is entirely at the Vercel
  platform layer, before the request reaches the app.**
- **Images**: covers and avatars are fetched with hand-built
  `URLRequest`s (`Views/Shared/BooqCoverView.swift:72`,
  `Views/Shared/AvatarView.swift:49`) from `imageBaseURL` =
  `https://img.booqs.app` in production. Dev maps `imageBaseURL` to
  `localhost:3000/api/images`, so `img.booqs.app` is **presumably a
  domain on this same Vercel project** (serving `app/api/images/`) and
  therefore covered by the same firewall — **unverified, dashboard
  check**. If it is, native image GETs are challengeable too and must be
  covered by the exemption.
- **Uploads**: `Booqs/Data/UploadState.swift` builds its own
  `URLRequest` against the upload endpoint (`app/api/upload/`).
- Only **Release builds target production** (`NetworkConfiguration.swift`:
  DEBUG → localhost, Release → `www.booqs.app`), so nothing in the
  day-to-day dev loop depends on this design — it gates device/TestFlight
  /App Store work.

All request sites hand-build `URLRequest`s, so **a custom header can ride
on every native request, images and uploads included** — no third-party
networking stack in the way.

## 4. Mechanism facts (Vercel, cited, July 2026)

- **Custom WAF rules** are free on all plans ([Usage & Pricing][pricing],
  2026-06-16). Actions: log / deny / challenge / **bypass** / redirect /
  rate limit. Changes apply immediately, **no redeploy**; rules can be
  re-ordered, disabled, deleted at any time ([Custom rules][custom-rules],
  2026-07-01).
- **Bypass semantics**: "allows specific traffic to skip any *subsequent*
  firewall rules … the request is allowed through any custom or managed
  rules" ([Firewall concepts][concepts]). Two consequences: it skips the
  bot-protection managed ruleset (documented verbatim in
  [Bot Management][bot-mgmt]), and it also skips any *later* custom rules
  — so **rate-limit rules that should still apply to exempted traffic
  must be ordered before the bypass rule** (§7).
- **Conditions** can match request parameters including path, method,
  header (key + value), cookie, query, user agent, IP, geolocation, ASN,
  and JA3/JA4 TLS fingerprints ([Rule configuration][rule-config];
  condition shape `{type, op, value, neg}` also visible in the
  [Firewall REST API][rest-api] — `PATCH /v1/security/firewall/config`,
  `rules.insert`). Header-value conditions on the Hobby plan
  specifically: believed available (conditions are part of the free
  custom-rules feature; the Enterprise-only gating found in the docs
  applies to rate-limit *counting keys*, not rule conditions) —
  **unverified, confirmed the moment the rule form accepts it**.
- **Rule-count limits**: Hobby — 3 custom rules total, 1 rate-limit rule;
  Pro — 40 rate-limit rules; Enterprise — 1000
  ([Rate limiting][rate-limiting], 2026-06-16). **The account's plan
  tier is unknown to this repo — unverified**; the recommended setup
  fits within Hobby's 3-rule budget, barely (§8).
- **Rate limiting** is a priced feature (Hobby: 1M allowed requests
  included; Pro: usage-based). Counting keys on Hobby/Pro: **IP and JA4
  only** (arbitrary header keys are Enterprise-only). Fixed window
  10s–10min ([Rate limiting][rate-limiting], [Usage & Pricing][pricing]).
- **`vercel.json` cannot express bypass** — its `routes[].mitigate`
  subset supports only `challenge` and `deny` ([Custom rules
  § Configuration in vercel.json][custom-rules]). So this exemption
  cannot be config-as-code in the repo; it lives in the dashboard (or
  via the [REST API][rest-api] / `vercel firewall` CLI, which a future
  script could reconcile).
- **Protection Bypass for Automation** (per-project secret, header
  `x-vercel-protection-bypass`): documented to skip deployment
  protection **plus** "System mitigations: … requests that the Vercel
  Firewall normally blocks" **plus** "Bot protection: … won't trigger
  Bot protection challenges"; it cannot override active-attack
  mitigations. Multiple named secrets per project, individually
  revocable ([Protection Bypass for Automation][pba], 2026-04-30).
- **System bypass rules** (a separate feature) are keyed on **IP/CIDR**
  (+ domain), paid plans only (Pro 25 / Enterprise 100)
  ([changelog][sysbypass-cl]) — useless for a mobile client whose IPs
  are arbitrary; listed here only to close the door on the name
  collision with the WAF bypass *action*.

## 5. The option space

| | Mechanism | If the token leaks, attacker gains | Revocation | Client change | Server/dashboard change | Plan dependency |
|---|---|---|---|---|---|---|
| **A** | WAF custom rule: secret header → **Bypass** | Challenge-free API access — i.e. exactly what any browser gets after passing a challenge; user data still gated by auth; capped by §7 rate limits | Edit rule value in dashboard — instant, no deploy | ~1 line per request site (4 sites) + secret plumbing | 1 dashboard rule (free) | None believed; header-value condition on Hobby unverified (§4) |
| **B** | Path-scoped **Bypass**, no secret (`/api/graphql`, `/api/images`, `/api/upload`) | n/a — no secret exists; *everyone* gets challenge-free API access | Delete rule | **Zero** | 1 dashboard rule (free) | None |
| **C** | Vercel's automation-bypass secret (`x-vercel-protection-bypass`) | Everything in A **plus** deployment-protection bypass — including preview deployments (unreviewed code, production env vars) if deployment protection is ever enabled | Revoke secret in dashboard; docs note regenerating invalidates deployments that baked the env var | Same as A | Generate secret (free) | All plans believed; unverified |
| **D** | Separate unchallenged API surface (second Vercel project / `api.booqs.app`) | n/a | n/a | Endpoint switch | **Repo split**: extract GraphQL + backend into a deployable second project; auth/CORS re-plumbing | None |
| **E** | App Attest device attestation, verified server-side | Nothing — the private key lives in the Secure Enclave and is not extractable | Per-device key revocation server-side | DCAppAttestService integration, key lifecycle, per-request assertions | Attestation verification service (Apple cert chain, key registry, counters, replay windows) + still needs a WAF-level exemption (see below) | None (Vercel-side); Apple: iOS 14+; macOS support needs verification |

Non-options, recorded so they aren't re-litigated:

- **UA-based bypass** (condition: user agent contains `Booqs`) — one
  `curl -A` away from public; strictly worse than B (same exposure,
  plus a false air of identity). Setting a distinctive UA is still worth
  doing for *observability* (§10 suggestion), just not as a credential.
- **JA4-keyed bypass** — the app's JA4 is Apple's URLSession TLS stack
  fingerprint, shared with every iOS app on that OS version and subject
  to change across OS updates: not app identity. Useful only as an
  auxiliary rate-limit key (included on all plans) or an extra AND
  condition to narrow A slightly.
- **System bypass rules** — IP-keyed; see §4.
- **Vercel "internal requests" allowance** (same-account Functions are
  never challenged) — doesn't apply to a device app.

Why C loses to A despite being purpose-built for skipping challenges:
the blast radius is a strict superset (deployment protection included),
the secret's scope is not ours to shape, and it's documented for
automation/testing rather than shipped clients. A is the same client
work with a tighter, self-owned scope.

Why D is deferred, not rejected: it's the only platform-clean line
(firewall config is per-project, so the API project simply never enables
challenges), but it restructures the repo for a problem a single free
rule solves today. Revisit if Vercel's protection model changes under us.

Why E is not the first move: attestation happens at the *application*
layer — Vercel's edge cannot verify App Attest assertions, so E does not
by itself stop the checkpoint; it needs A or B underneath at the WAF
layer regardless (e.g. bypass keyed on assertion-header *presence*, with
the route rejecting invalid assertions). E is the real answer to §6, as
hardening on top of A, when there's evidence of abuse worth its cost.

## 6. Embedded-secret reality — said honestly

A secret shipped in an iOS binary is **extractable** by a motivated
person: static analysis of the app bundle, or runtime interception (the
header value crosses a proxy the moment someone runs the app through
one with a trusted root installed). Obfuscation raises the bar; it does
not change the conclusion. Therefore option A's header is **not
authentication** — it is a *de-cloaking tag for legitimate traffic*
whose security properties are:

- The exemption's value survives casual/automated abuse: scrapers and
  drive-by scripts don't know the header; the default posture for all
  other traffic is unchanged.
- What a targeted attacker gains is bounded: the same API access a
  browser session gets after solving one challenge — with user data
  still behind passkey auth (`X-Access-Token`), and volume capped by
  the rate-limit rules in §7.
- Recovery is cheap: rotate the value in the dashboard (instant), ship
  the new value in an app update, keep a two-value overlap window
  (§9 step 7) so existing installs don't break on rotation day.

Real client authentication is App Attest (option E) — hardware-backed,
non-extractable — and the layered path A → A+E is the honest long-term
shape if abuse ever materializes. For a reading app whose worst
unauthenticated surface is public-domain book search/content, A's
posture is proportionate today.

## 7. Rate-limiting composition (and the uploads item)

The hub HANDOFFS backlog already notes native uploads land on an
endpoint with no rate limit. This design composes with that item rather
than conflicting, with one **load-bearing ordering rule**: a matched
bypass skips all *subsequent* rules (§4), so anything that must still
constrain native traffic goes **above** the bypass. Target rule order:

1. **Rate limit** — path starts with `/api/graphql` OR `/api/upload`,
   keyed by IP (the all-plans key; per-device ≈ per-IP for mobile),
   fixed window, action 429. Limits to taste at publish time (e.g.
   120/min for GraphQL; uploads want a much lower ceiling — on Pro these
   can be two rules with separate limits; on Hobby there is exactly one
   rate-limit slot, so start with the OR'd rule at the GraphQL-scale
   limit and treat a dedicated upload limit as an app-level follow-up).
2. **Bypass** — the option-A rule (secret header, path starts `/api/`).
3. Managed bot-protection ruleset / Attack Mode — unchanged, still
   challenging everything that didn't match rule 2.

Web-browser traffic: passes 1 (normal volumes), doesn't match 2,
challenged at 3 exactly as today. Native traffic: capped by 1, exempted
by 2. An attacker with the leaked header: capped by 1 — which is the
§6 bound.

On Hobby this consumes 2 of 3 custom-rule slots and the 1 rate-limit
slot. Rate limiting is priced (§4) — at this product's traffic the
Hobby included volume is ample; on Pro it's usage-based (cheap at this
scale, but non-zero — flagging since the plan tier is unverified).

## 8. Recommendation

**Revised 2026-07-29 after Anton's review: adopt B now — a path-scoped
bypass, no secret — and hold A as the pre-designed escalation if
GraphQL abuse ever shows up in the firewall logs. E stays the far-end
hardening step; C and D remain declined.**

Rationale for B-first: the WAF was enabled against page scrapers, and
there is no recorded evidence of scrapers speaking GraphQL. What B
concedes is scripted reads of public-domain content and search — a
low-value target. The load-bearing facts were verified in code:
`/api/upload` is auth-gated on both legs (`data/upload.ts` resolves the
current user before issuing an upload URL and before confirming, so a
bypassed path still requires an account), and the platform's always-on
DDoS mitigation is not subject to WAF bypass rules, so burst abuse of
bypassed paths stays capped. One nuance to record honestly: with
GraphQL bypassed, image paths become enumerable through the API
(booq ids → content → `/api/images/<booq_id>/<file_path>`), so "images
require knowing names" weakens from a barrier to an inconvenience —
acceptable for public-domain covers. B is also the smallest change that
can work: one dashboard rule, zero required client work, no secret
lifecycle.

Two hedges keep the A escalation a pure dashboard flip:

- **Ship the dormant `x-booqs-client` header in the native client
  anyway** (§10). Under B no rule reads it; but with the header already
  in shipped builds, escalating to A is tightening the existing rule's
  condition — no app-release coordination, no broken installs. Mint the
  secret once, store it in the password manager, bake that value.
- The §7 rate-limit rule stays designed-not-deployed, added on the same
  evidence that triggers A; the §7 ordering rule applies unchanged when
  it lands.

Escalation trigger: `/api/graphql` match volume on the bypass rule that
looks scripted (Firewall overview, grouped by path) — §9 step 6.

## 9. Rollout — Anton's dashboard checklist

Safe against production by construction: log-first (Vercel's own
recommended practice), no deploys, every step reversible by deleting or
disabling a rule.

1. **Recon** — Firewall → Bot Management: note which of Attack Mode /
   Bot Protection ruleset is enabled (settles §2), and the plan tier
   (settles §4's limits). Domains: confirm `img.booqs.app` is on this
   project (settles §3).
2. **Create the bypass rule in log mode** — name `native-app-access`;
   condition (OR-joined): path starts with `/api/graphql` · path starts
   with `/api/images` · path starts with `/api/upload` · path equals
   `/.well-known/apple-app-site-association`; action **Log**. Publish.
   The AASA path is for **Apple's fetcher**, a non-browser client that
   must read that file for native passkey associated-domains to work
   once the AASA commit deploys — drop it from the rule only after
   verifying Apple's fetch passes the challenge unaided (it may count
   as a verified bot; unverified).
3. **Probe** — a few (not rapid-fire — §2 layer 3 is burst-sensitive)
   `curl`s against `https://www.booqs.app/api/graphql`, POST
   `{"query":"query { featured(limit: 1) { title } }"}` with
   `Content-Type: application/json`: expect the checkpoint (429/HTML)
   as today, with the match visible under the rule's grouping in the
   Firewall overview.
4. **Flip to Bypass**, publish, re-probe — expect GraphQL JSON. This is
   also the moment §2's open question (does bypass clear the specific
   enabled challenge layer) gets its empirical answer. If JSON doesn't
   come back, stop; nothing shipped depends on the rule yet — check
   the firewall log and fall back to evaluating D.
5. **Web-posture regression check** — load a page in a fresh browser
   session: challenged exactly as before (the rule matches only the
   API paths). Optionally re-run the §3 probe from a browser devtools
   fetch to confirm the web app itself is unaffected either way.
6. **Escalation watch (ongoing, casual)** — when visiting the
   dashboard, glance at the bypass rule's match volume grouped by
   path. Scripted-looking `/api/graphql` volume is the trigger to move
   to A (§8): tighten this same rule with an AND condition on the
   `x-booqs-client` header the client already ships dormant (§10), and
   add the §7 rate-limit rule above it — both pure dashboard changes.

No rotation drill under B — there is no secret. A's secret lifecycle
(§6) applies only after escalation; mint and store the secret value at
Track B implementation time so shipped builds carry the final value.

## 10. Future implementation plan (client/server — separately granted)

Client (swiftui-app; not this repo's work, recorded for the grant).
Under B **none of this is required for the app to function** — the
header items are the §8 dormant hedge that makes the A escalation a
dashboard-only change, so they should still ship with the first
production-pointed build:

- **Where the value lives** (the app repo has no `.env` mechanism; a
  gitignored xcconfig is the iOS equivalent): `Secrets.xcconfig` next
  to the project, gitignored, holding `BOOQS_CLIENT_TOKEN = <value>`,
  with a committed `Secrets.template.xcconfig` placeholder; wired with
  an optional include (`#include? "Secrets.xcconfig"`) so Debug builds
  and fresh clones build without it; surfaced to code via an Info.plist
  key (`BooqsClientToken = $(BOOQS_CLIENT_TOKEN)`) read in
  `NetworkConfiguration.swift`. Canonical copy: the password manager
  (pasted into the WAF rule condition at escalation time). Calibration:
  the swiftui-app repo is private (verified 2026-07-29) and the value
  is extractable from any shipped binary regardless (§6), so the bar is
  "out of git history", not vault-grade — but it must never appear in
  the nextjs-app repo, which is **public**. Optional guard: a
  Release-only build phase failing on an empty value, so hedge-less
  builds can't ship silently.
- `Booqs/Network/GraphQLClient.swift` `makeRequest` — set
  `x-booqs-client` (covers queries, mutations, and SSE subscribe, which
  share the builder).
- `Views/Shared/BooqCoverView.swift` / `AvatarView.swift` /
  `Data/UploadState.swift` — same header on their hand-built requests
  (needed if step 1 confirms `img.booqs.app` is on the project; harmless
  regardless).
- Suggested alongside (observability, not security): set an explicit
  `User-Agent: Booqs/<version> (<platform>)` so native traffic is
  distinguishable in the Firewall overview and app logs.
- Verification: Release-configuration build on device against
  production — the exact scenario that failed on 2026-07-28 — then the
  TestFlight path.

Server (this repo): **no changes required**. Optional later, with the
uploads rate-limit follow-up: app-level per-user limits on
`app/api/upload/` (WAF per-IP limits can't see users; the backlog item
stays open).

## Sources

Vercel docs (fetched 2026-07-28; `last_updated` as published):

- [Attack Mode][attack-mode] (2026-05-08)
- [Bot Management][bot-mgmt] (2026-07-09)
- [Firewall concepts][concepts] (2026-06-16)
- [WAF Custom Rules][custom-rules] (2026-07-01)
- [WAF Rate Limiting][rate-limiting] (2026-06-16)
- [WAF Usage & Pricing][pricing] (2026-06-16)
- [Protection Bypass for Automation][pba] (2026-04-30)
- [Rule Configuration Reference][rule-config] (2025-04-21)
- [Firewall REST API][rest-api]; [system-bypass changelog][sysbypass-cl]

Repo evidence: swiftui-app
[docs/pitfalls.md](../../swiftui-app/docs/pitfalls.md) § Backend
Environment; [docs/quire-integration.md](../../swiftui-app/docs/quire-integration.md)
§7; this repo's [proxy.ts](../proxy.ts) and
[app/api/graphql/route.ts](../app/api/graphql/route.ts).

Unverified items, collected: plan tier; which challenge layer is
enabled; bypass-vs-Attack-Mode interaction (empirical in §9.4);
header-value conditions on Hobby; `img.booqs.app` project membership;
App Attest on macOS.

[attack-mode]: https://vercel.com/docs/vercel-firewall/attack-mode
[bot-mgmt]: https://vercel.com/docs/bot-management
[concepts]: https://vercel.com/docs/vercel-firewall/firewall-concepts
[custom-rules]: https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
[rate-limiting]: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
[pricing]: https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing
[pba]: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
[rule-config]: https://vercel.com/docs/vercel-firewall/vercel-waf/rule-configuration
[rest-api]: https://vercel.com/docs/vercel-firewall/firewall-api
[sysbypass-cl]: https://vercel.com/changelog/vercel-firewall-now-supports-bypassing-system-mitigations-for-specific-ips
