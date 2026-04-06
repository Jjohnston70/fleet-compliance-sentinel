Implement OpenRouteService integration in tooling/dispatch-command for real road-based routing, ETA, and nearest-driver selection while preserving backward compatibility.

Context

You are working inside the repo:

Pipeline-Punks/00-FLEET-COMPLIANCE-SENTINEL

Target module:

tooling/dispatch-command

This module is already a reusable TNDS service package used for dispatch business logic. It follows a 6-layer pattern and is intended to remain reusable, testable, and suitable for app/API/LLM consumption. Do not move routing logic into UI pages or app route handlers. The change must happen inside the module so downstream consumers inherit the improved routing automatically.

Current state

The current routing implementation is here:

tooling/dispatch-command/src/services/routing-service.ts

It currently:

calculates straight-line distance with the Haversine formula
estimates travel time from distance using configured average MPH
finds nearest candidate by straight-line distance
optimizes route order using greedy nearest-neighbor

Current methods:

RoutingService.calculateDistance(from, to): number
RoutingService.estimateTravelTime(distance): number
RoutingService.findNearest(origin, candidates)
RoutingService.optimizeRoute(origin, stops)
Why this change is needed

The current implementation is useful as a fallback but not accurate enough for production dispatch decisions because it uses crow-flies distance rather than road routing. We want to integrate OpenRouteService so dispatch decisions are based on actual route distance and actual estimated travel time.

Goal

Upgrade the routing layer in dispatch-command to support OpenRouteService (ORS) as the primary routing provider while preserving the existing module contract and keeping Haversine as fallback.

The end result should allow dispatch logic to use:

road distance
road ETA
more accurate nearest-driver selection
future route optimization expansion

without breaking the rest of the module.

End State Goals

By the end of this work, the dispatch module should:

Support provider-based routing
ORS provider for real routing
Haversine provider for fallback/local/test use
Preserve the module’s role as the single routing source of truth
no ORS calls from UI code
no ORS calls directly from app route handlers unless they are simply invoking module APIs
Keep the public surface stable enough that current consumers do not break unnecessarily
Allow configuration through environment/config
choose routing provider by env
configure ORS API key, profile, timeout, base URL if needed
Fail safely
if ORS fails or times out, routing should degrade gracefully to Haversine rather than breaking dispatch
Be fully tested
unit tests for provider selection
unit tests for fallback behavior
mock ORS responses in tests
no live API dependency in normal unit tests
Be documented
README updates
.env.example updates
comments explaining architecture and extension points
Constraints

Follow these constraints carefully.

Architectural constraints
Keep the implementation inside tooling/dispatch-command
Do not push routing logic into app pages, UI components, or external wrappers
Keep the module reusable and TNDS-pattern aligned
Keep strict TypeScript compatibility
Preserve current exports unless there is a compelling reason to extend them
Prefer small, surgical changes over broad rewrites
Backward compatibility constraints
Existing callers should continue to work as much as possible
Do not remove existing methods without replacement
If a signature must evolve, do it in a backward-compatible manner when possible
Keep Haversine available as fallback and default for tests unless configured otherwise
Operational constraints
Never require live ORS access for unit tests
Add timeouts and error handling around external calls
Avoid leaking secrets in logs
Do not hardcode API keys
Respect regulated-data assumptions; only send coordinates needed for routing, not unnecessary PII
Code quality constraints
TypeScript strict mode only
Clear interfaces and comments
Reusable abstractions, not one-off glue code
No dead code
No direct network logic scattered across unrelated services
Recommended Architecture

Implement a provider-based routing design.

Proposed structure

Inside:

tooling/dispatch-command/src/services/

add or refactor toward something like:

routing-types.ts
routing-provider.ts
haversine-routing-provider.ts
openrouteservice-routing-provider.ts
routing-service.ts
Design intent

RoutingService should become a facade over provider implementations.

Example conceptual flow
DispatchService / AutoDispatcher / API handlers
↓
RoutingService
┌─────────┴─────────┐
↓ ↓
HaversineRoutingProvider OpenRouteServiceProvider
Provider responsibilities
Haversine provider
preserve current logic
local fallback
zero external dependencies
usable in tests and offline scenarios
OpenRouteService provider
call ORS directions endpoint for point-to-point routing
return:
route distance
travel duration
optional geometry if useful
be designed so matrix/optimization support can be added later
Implementation requirements

1. Keep and upgrade the routing API

Preserve the current public behavior where possible.

Required methods

Support these existing operations:

calculateDistance(from, to)
estimateTravelTime(...)
findNearest(origin, candidates)
optimizeRoute(origin, stops)
Recommended improvement

Right now estimateTravelTime(distance) assumes distance-only math. With ORS, travel time should come from route results, not just MPH. You may need to:

preserve estimateTravelTime(distance) for backward compatibility
add a richer method such as:
getRoute(from, to)
calculateRoute(from, to)
estimateTravelTimeBetween(from, to)

Then use that richer route data internally while keeping the older method available.

2. Introduce route result types

Create strong types for returned route data, such as:

distance miles
distance meters
duration minutes
duration seconds
provider used
geometry optional
fallback used boolean 3. Add ORS configuration

Extend config and .env.example to support at least:

ROUTING_PROVIDER=haversine|openrouteservice
ORS_API_KEY=...
ORS_PROFILE=driving-car
ORS_BASE_URL=... optional
ORS_TIMEOUT_MS=4000

Wire these through the existing config layer.

4. Add safe fallback behavior

If ORS:

has no API key
times out
returns an error
returns invalid data

then fallback to Haversine automatically and predictably.

Fallback should be explicit in code and ideally observable in returned metadata or logs.

5. Improve nearest-driver logic

Update nearest-driver selection so it can use actual route ETA rather than straight-line distance.

Recommended approach:

first prefilter candidates using Haversine for cheap screening
then call ORS only on a narrowed set of candidates
choose nearest by travel time, not just direct distance

This avoids excessive API calls and preserves performance.

6. Route optimization

Do not overbuild this on day one.

Minimum acceptable:

retain the current greedy route optimization as fallback
document that advanced route optimization can be added later

Optional stretch:

prepare provider interface so ORS matrix/optimization can be added later without redesign 7. Data model consideration

The current request schema appears address-based, while ORS needs coordinates. Ensure the routing layer clearly assumes or requires Location coordinates.

If dispatch requests do not reliably have coordinates yet:

do not cram geocoding into this task unless necessary
document the dependency clearly
allow routing methods to operate on Location inputs only
add TODO or interface notes for upstream geocoding/service-location enrichment 8. Testing

Add or update tests under:

tooling/dispatch-command/tests/

Required coverage:

existing Haversine behavior still works
provider selection works
ORS response mapping works
ORS error -> Haversine fallback works
nearest-driver selection behaves correctly with mocked route durations
no live external calls in unit tests 9. Documentation

Update:

tooling/dispatch-command/README.md
tooling/dispatch-command/.env.example

Document:

new env vars
provider behavior
fallback behavior
how to use ORS mode
what remains Haversine fallback
Deliverables

Produce the following deliverables.

Code deliverables
Refactored routing layer with provider abstraction
ORS provider implementation
Haversine provider retained/refactored
Config additions for routing provider selection
Updated tests
Updated exports if needed
README and .env.example updates
Documentation deliverables
Brief architecture note in comments or README
Explanation of fallback behavior
Clear statement of what is real road routing vs heuristic fallback
Output deliverables

At the end, provide:

Summary of files changed
Why each file changed
Any new env vars
Any API or method signature changes
Test results
Known limitations / follow-up items
Example usage snippet
Suggested file-by-file plan

Use this as the working plan unless you find a better surgical structure.

Existing file to refactor
tooling/dispatch-command/src/services/routing-service.ts
Likely new files
tooling/dispatch-command/src/services/routing-types.ts
tooling/dispatch-command/src/services/routing-provider.ts
tooling/dispatch-command/src/services/haversine-routing-provider.ts
tooling/dispatch-command/src/services/openrouteservice-routing-provider.ts
Likely config updates
tooling/dispatch-command/src/config/index.ts
tooling/dispatch-command/.env.example
Likely tests to update/add
tooling/dispatch-command/tests/routing-service.test.ts
possibly new provider-specific test files if appropriate
Likely docs update
tooling/dispatch-command/README.md
Likely export updates
tooling/dispatch-command/src/index.ts
Technical guidance
ORS integration expectations

Use OpenRouteService in a clean, minimal way:

directions for point-to-point route calculation
driving profile by default
parse returned distance and duration
convert units carefully
handle timeout and non-200 cases
Performance guidance
avoid calling ORS for every candidate when a cheap prefilter can reduce the set
keep fallback local and fast
avoid repeated redundant route calculations if caching is easy and low-risk
Logging guidance
log operational failures safely
do not log secrets
do not log unnecessary customer-identifiable data
coordinates only if needed for debugging and only at safe verbosity
Non-goals

Do not include these unless required for the implementation to function:

full geocoding pipeline
frontend map rendering
full dispatch UI changes
Firestore migration
mobile app changes
advanced multi-stop optimization engine beyond preparing the seam
traffic-aware enterprise features beyond what ORS basic routing returns
Definition of done

The task is done when:

dispatch-command can use ORS as configured
routing falls back safely to Haversine
nearest-driver logic can use road ETA
tests pass without live ORS dependency
docs and env examples are updated
module remains reusable and cleanly exported
Required final response format

When finished, respond with these sections:

1. What changed

Concise explanation of the implementation.

2. Files changed

Bullet list of each file modified/added.

3. Config added

List of new environment variables and defaults.

4. Compatibility notes

Anything preserved, deprecated, or changed.

5. Test status

Which tests were added/updated and whether they pass.

6. Known limitations

What still depends on upstream coordinates or future enhancements.

7. Example usage

Show a minimal code example of using the routing layer in ORS mode.

Final instruction

Make the smallest clean set of changes that achieves production-usable ORS integration inside tooling/dispatch-command without breaking the module’s TNDS architecture.
