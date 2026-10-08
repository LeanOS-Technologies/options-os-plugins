# Trading System Intent

> Entry point. A trader writes this intent; the written intent is the seed for the whole specification. Nothing downstream may contradict it.

## Goal

Translate trading intuition into deterministic, buildable system semantics.

This is not a technical design. It is the source document for:

```text
/translate --profile trading
```

---

# 0. System Principles

## 0.1 Determinism Requirement

All trading definitions must be:

* observable from defined inputs
* unambiguous
* consistent across readers
* reducible to explicit states and transitions
* compatible with automated implementation

If two independent engineers would build different behavior, the definition is incomplete.

## 0.2 Strategy / Risk / Execution Separation

| Layer     | Decides                                                              | Must Not Do                                                      |
| --------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Strategy  | setup, signal, invalidation, expiry, candidate selection             | submit venue orders, mutate positions, read persistence directly |
| Risk      | approve, reject, clip, halt, defend, reduce                          | invent strategy edge, hide overrides                             |
| Execution | convert accepted plans into command sequences                        | invent strategy logic, infer fills                               |
| Adapter   | translate canonical commands/facts to venue-native protocol and back | leak venue-native semantics into domain                          |
| Book      | own portfolio projection and reconciliation result                   | infer fills from orders                                          |
| Runtime   | schedule and interpret declared semantics                            | create new business rules                                        |

## 0.3 Risk Override Rule

Risk overrides strategy and execution.

A valid strategy signal becomes non-actionable if risk rejects, clips, halts, or routes it to defend/reduce mode.

## 0.4 Freshness Rule

No trading decision may use market data, account state, position state, margin state, fee state, funding state, or venue state outside its declared freshness window.

## 0.5 Operator Command Rule

Manual/operator intervention is allowed only as an explicit command with:

* command type
* actor
* reason
* target object
* allowed state transition
* audit event
* recovery semantics

Unmodeled discretionary intervention is out of scope.

## 0.6 Cost Rule

No strategy is build-ready until fees, funding/carry, slippage, spread, and settlement costs are either explicitly modeled or explicitly declared irrelevant with justification.

## 0.7 Structure Rule

An options trade may be a structure, not a single order.

A structure is build-ready only when its legs, ratios, pricing rule, atomicity rule, partial-fill behavior, and venue capability fallback are explicit.

## 0.8 Order Lifecycle Rule

No order state may be inferred from intent alone.

Order state must be driven by:

* venue acknowledgement
* venue rejection
* venue order stream
* fill stream
* venue order history
* reconciliation result
* explicit recovery command

## 0.9 Placement Policy Rule

A valid entry, exit, hedge, or reduce intent is not executable until it resolves to a deterministic placement policy.

Placement policy defines how an accepted intent becomes one or more live order commands.

Execution placement may optimize placement behavior, but it must not invent strategy logic.

## 0.10 Duplicate Command Rule

The system must prevent duplicate placement, duplicate cancellation, duplicate replacement, duplicate hedge, and duplicate exit commands.

Every command-producing path must define idempotency keys, parent intent links, and recovery behavior.

## 0.11 Data Quality Rule

Fresh data is not automatically valid data.

Market, venue, account, instrument, cost, and derived inputs must define invalid-data conditions and required behavior when invalid data is observed.

## 0.12 Recovery Rule

Restart, reconnect, timeout, unknown order state, partial fill, and in-flight command interruption must resolve through declared recovery semantics.

No in-flight command may be silently ignored after recovery.

## 0.13 Opportunity Rule

The system trades because a candidate is worth more than doing nothing, not because a list of conditions happened to pass.

Every condition written in this intent has exactly one role:

| Role        | Question it answers                                                                   | Effect when not met                                                        |
| ----------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Impossible  | Can this trade actually be done now? (instrument missing, no bid, no margin, venue cannot place it) | candidate removed                                                          |
| Not allowed | Does the mandate forbid the resulting exposure? (vega, gamma, loss, concentration limits)           | candidate removed or resized                                               |
| Preference  | Does this make the trade more or less attractive? (IV level, skew shape, percentile, regime)        | changes edge, required cushion, size, or rank; never removes a candidate by itself |

Doing nothing is always a candidate.

A trade happens only when the best remaining candidate's expected edge, after costs, exceeds its required cushion.

A condition declared Impossible or Not allowed must state why it is not a Preference.

If the conditions together leave no market in which the system would trade, change the market idea or the mandate. Adjusting individual thresholds does not fix this.

---

# 1. Trading Universe

| Field                                  | Value                              |
| -------------------------------------- | ---------------------------------- |
| Venues                                 |                                    |
| Environments                           | testnet / live                     |
| Accounts                               |                                    |
| Subaccounts                            |                                    |
| Assets                                 |                                    |
| Instruments                            |                                    |
| Settlement Type                        | inverse / linear / cash / physical |
| Margin Mode                            | cross / isolated / portfolio       |
| Quote Assets                           |                                    |
| Collateral Assets                      |                                    |
| Strategy Instances                     |                                    |
| Allowed Trading Sessions               |                                    |
| Excluded Venues / Assets / Instruments |                                    |

## Required Universe Rules

| Rule                                 | Definition |
| ------------------------------------ | ---------- |
| Admission rule                       |            |
| Deactivation rule                    |            |
| Unsupported-instrument behavior      |            |
| Expired/inactive instrument handling |            |
| Venue capability admission rule      |            |
| Strategy-instance admission rule     |            |
| Structure admission rule             |            |
| Order-placement admission rule       |            |
| Recovery admission rule              |            |

---

# 2. Strategy Identity

| Field                                   | Value |
| --------------------------------------- | ----- |
| Strategy Name                           |       |
| Strategy Family                         |       |
| Variant Name                            |       |
| Version                                 |       |
| Independent / Confirming / Hierarchical |       |
| Holding Period                          |       |
| Directionality                          |       |
| Intended Risk                           |       |
| Forbidden Risk                          |       |
| Expected Trade Frequency                |       |
| Longest Acceptable Idle Period          |       |

Expected Trade Frequency is how often you expect the idea to be present and worth trading, e.g. "2–6 entries per month in ordinary markets".

If the system stays idle longer than the Longest Acceptable Idle Period, the specification is reviewed (see 18).

---

# 3. Core Market Idea

Describe the recurring market behavior in plain language.

Do not use formulas or implementation details here.

| Field                             | Definition |
| --------------------------------- | ---------- |
| Market behavior                   |            |
| Why it should create edge         |            |
| When the edge should disappear    |            |
| What would prove the idea invalid |            |

---

# 4. Observable Market Behavior

Define what the system can observe when the idea is active.

| Observable                      | Required? | Definition |
| ------------------------------- | --------: | ---------- |
| Price behavior                  |           |            |
| Volatility behavior             |           |            |
| Volume / open-interest behavior |           |            |
| Liquidity behavior              |           |            |
| Term-structure behavior         |           |            |
| Skew / surface behavior         |           |            |
| Funding behavior                |           |            |
| Spread behavior                 |           |            |
| Venue microstructure behavior   |           |            |

Forbidden vague terms:

```text
strong
weak
clean
good
bad
high probability
cheap
expensive
normal
abnormal
significant
```

A vague term becomes allowed only after it is defined as an observable rule.

A defined term such as "expensive" describes how attractive a trade is. By default it is a Preference (0.13): it feeds the edge definition in 8 and does not block trading unless the 6.1 Condition Role Table classifies it otherwise.

---

# 5. Inputs

## 5.1 Market Data Inputs

| Input               | Source | Freshness Window | Required? | Fallback If Missing | Blocks Trading? |
| ------------------- | ------ | ---------------: | --------: | ------------------- | --------------: |
| Orderbook           |        |                  |           |                     |                 |
| Trades              |        |                  |           |                     |                 |
| Mark Price          |        |                  |           |                     |                 |
| Index Price         |        |                  |           |                     |                 |
| IV                  |        |                  |           |                     |                 |
| Greeks              |        |                  |           |                     |                 |
| Funding             |        |                  |           |                     |                 |
| Fee Schedule        |        |                  |           |                     |                 |
| Instrument Metadata |        |                  |           |                     |                 |

## 5.2 Venue State Inputs

| Input                             | Source                                  | Freshness Window | Required? | Fallback If Missing       | Blocks Trading? |
| --------------------------------- | --------------------------------------- | ---------------: | --------: | ------------------------- | --------------: |
| Open Orders                       |                                         |                  |           |                           |                 |
| Order History                     |                                         |                  |           |                           |                 |
| Fills                             |                                         |                  |           |                           |                 |
| Positions                         |                                         |                  |           |                           |                 |
| Balance / Margin                  |                                         |                  |           |                           |                 |
| Rate-Limit State                  |                                         |                  |           |                           |                 |
| Venue Capabilities                | venue metadata / adapter capability map |                  |       yes | none                      |             yes |
| Tick / Lot / Contract Constraints | instrument metadata                     |                  |       yes | none                      |             yes |
| Min / Max Order Size              | venue / instrument metadata             |                  |       yes | none                      |             yes |
| Post-Only Support                 | venue capability map                    |                  |           | fallback policy           |                 |
| Reduce-Only Support               | venue capability map                    |                  |           | fallback policy           |                 |
| Combo Order Support               | venue capability map                    |                  |           | fallback policy           |                 |
| RFQ Support                       | venue capability map                    |                  |           | fallback policy           |                 |
| Batch Placement Support           | venue capability map                    |                  |           | fallback policy           |                 |
| Replace / Amend Support           | venue capability map                    |                  |           | cancel-replace fallback   |                 |
| Open Order Capacity               | venue / account state                   |                  |       yes | throttle / reject         |                 |
| Placement Latency State           | adapter / runtime metric                |                  |           | widen / reject / fallback |                 |
| Cancel Latency State              | adapter / runtime metric                |                  |           | widen / reject / fallback |                 |
| Unknown Order State               | venue / reconciliation                  |                  |       yes | recover / block           |             yes |

## 5.3 Derived Inputs

| Derived Input | Formula / Rule | Source Inputs | Owner | Recompute Trigger |
| ------------- | -------------- | ------------- | ----- | ----------------- |
|               |                |               |       |                   |

## 5.4 Data Quality Rules

Fresh data is not automatically valid data.

Each required input must define invalid-data conditions and required behavior.

| Input                   | Invalid If                                                                               | Action                                 |
| ----------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| Orderbook               | crossed, empty, stale, insufficient depth, impossible spread, missing best bid/ask       | block / fallback / mark degraded       |
| Trades                  | stale, outlier print, missing sequence, non-monotonic timestamp                          | ignore / degrade / block               |
| Mark Price              | deviates beyond threshold from index, book, or settlement reference                      | block / degrade / require confirmation |
| Index Price             | stale, missing constituent source, impossible jump                                       | block / degrade / fallback             |
| IV                      | missing, stale, impossible value, outside configured bounds                              | block / interpolate / reject candidate |
| IV Surface              | missing node, stale node, arbitrage violation, broken interpolation, impossible smile    | block / interpolate / reject candidate |
| Greeks                  | stale, computed from invalid IV, missing required leg, impossible sign                   | block / recompute / reject             |
| Funding                 | stale, unavailable, outside configured tolerance                                         | block / mark cost unknown              |
| Fee Schedule            | missing, stale, wrong tier, unknown maker/taker fee                                      | block trading                          |
| Instrument Metadata     | missing tick, lot, expiry, settlement, contract size, option type, strike, expiry status | block trading                          |
| Venue Capabilities      | missing capability map, contradicts configured requirement                               | block / fallback / reject              |
| Balance / Margin        | stale, missing, inconsistent with positions                                              | block / reconcile                      |
| Positions               | stale, inconsistent with fills, missing instrument                                       | block / reconcile                      |
| Fills                   | duplicate, missing sequence, impossible quantity, impossible price                       | quarantine / reconcile / block         |
| Open Orders             | stale, missing known order, unknown live order                                           | recover / reconcile / block            |
| Rate-Limit State        | unavailable or exceeded                                                                  | throttle / queue / reject              |
| Placement Latency State | exceeds configured placement threshold                                                   | degrade / widen / reject / fallback    |

No invalid input may be silently converted into a valid trading fact.

---

# 6. Setup Definitions

A setup is a complete fresh observable market condition.

For each setup:

| Field                   | Definition |
| ----------------------- | ---------- |
| Setup ID                |            |
| Name                    |            |
| Conditions              |            |
| Timeframe               |            |
| Confirmation Rule       |            |
| Invalidation Rule       |            |
| Expiry Rule             |            |
| Required Inputs         |            |
| Forbidden Inputs        |            |
| Required Freshness      |            |
| Coexistence Rules       |            |
| Output If Not Satisfied | `NoSetup`  |

A setup describes when the idea applies, not when it is ideal. Conditions that describe the ideal case are Preferences.

## 6.1 Condition Role Table

Every condition used in setup (6), signal (7), candidate (8), structure (8A), and entry (9) rules is listed here once, with its role per 0.13.

| Condition | Used In | Observable Rule | Role (Impossible / Not allowed / Preference) | If Preference: Effect (edge / cushion / size / rank) | If Not Preference: Why | Expected Pass Rate |
| --------- | ------- | --------------- | -------------------------------------------- | ---------------------------------------------------- | ---------------------- | -----------------: |
|           |         |                 |                                              |                                                      |                        |                    |

Expected Pass Rate is the trader's estimate of how often the condition holds. It is checked against observed data in 17 and 18.

---

# 6A. Strategy Instance State Rules

A strategy instance must define its own state boundaries.

A setup, signal, candidate, position, exit, and cooldown must be stateful and deterministic.

| Field                          | Definition                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Instance State                 | idle / observing / setup-active / signal-active / candidate-selected / approved / placing / in-position / exiting / cooling-down / disabled |
| Initial State                  |                                                                                                                                             |
| State Owner                    | strategy / runtime                                                                                                                          |
| State Persistence Rule         | what state survives restart                                                                                                                 |
| State Reset Rule               | what event clears setup, signal, candidate, position, or cooldown state                                                                     |
| Duplicate Setup Rule           | ignore / refresh / merge / reject                                                                                                           |
| Duplicate Signal Rule          | ignore / refresh / merge / reject                                                                                                           |
| Duplicate Candidate Rule       | ignore / refresh / replace / reject                                                                                                         |
| Re-entry Rule                  | when the same setup may create another trade                                                                                                |
| Cooldown Rule                  | required delay or condition after entry, exit, loss, rejection, failed execution, or operator intervention                                  |
| Concurrent Instance Rule       | whether multiple instances may trade same venue, instrument, expiry, structure, or exposure                                                 |
| Shared Exposure Rule           | how multiple instances share risk budget                                                                                                    |
| Instance Deactivation Rule     | when the instance stops observing or trading                                                                                                |
| Instance Reactivation Rule     | when the instance may resume                                                                                                                |
| Output If State Blocks Trading | `InstanceStateReject`                                                                                                                       |

## Required Instance State Transitions

| Current State      | Allowed Next States                                | Transition Trigger |
| ------------------ | -------------------------------------------------- | ------------------ |
| idle               | observing / disabled                               |                    |
| observing          | setup-active / disabled                            |                    |
| setup-active       | signal-active / observing / disabled               |                    |
| signal-active      | candidate-selected / observing / disabled          |                    |
| candidate-selected | approved / observing / disabled                    |                    |
| approved           | placing / rejected / disabled                      |                    |
| placing            | in-position / cooling-down / recovering / disabled |                    |
| in-position        | exiting / cooling-down / disabled                  |                    |
| exiting            | cooling-down / recovering / disabled               |                    |
| cooling-down       | observing / disabled                               |                    |
| recovering         | observing / in-position / exiting / disabled       |                    |
| disabled           | observing                                          |                    |

No transition may occur without an event.

---

# 7. Signal Rules

A signal represents a potential trade before risk approval and before execution.

| Field                | Definition                  |
| -------------------- | --------------------------- |
| Signal ID Rule       |                             |
| Signal Name          |                             |
| Originating Setup    |                             |
| Direction            |                             |
| Creation Rule        |                             |
| Expiry Rule          |                             |
| Invalidation Rule    |                             |
| Can Coexist With     |                             |
| Blocks               |                             |
| Required Explanation |                             |
| Output If Rejected   | `NoSignal` / `SignalReject` |

---

# 8. Candidate and Selection Rules

A candidate is not an order. It is a proposed trade/action before final sizing and risk approval.

| Field                     | Definition |
| ------------------------- | ---------- |
| Candidate Types           |            |
| Candidate Generation Rule |            |
| No-Trade Candidate        | always present; edge = 0 |
| Edge Definition           |            |
| Cost Deduction            |            |
| Required Cushion          |            |
| Ranking Metric            | default: edge after costs minus required cushion |
| Selection Rule            | default: highest-ranked candidate; trade only if it ranks above No-Trade |
| Tie-Breaking Rule         |            |
| Rejection Conditions      | Impossible / Not allowed only (see 6.1) |
| Required Instruments      |            |
| Required Capability Set   |            |

Edge Definition, in plain terms, is what the trade is expected to earn minus what it is expected to give back over the holding period. Example: premium collected minus the expected cost of the moves that premium insures against.

Cost Deduction lists the costs from 0.6 (fees, spread, slippage, hedging, funding) that are subtracted before the comparison.

Required Cushion is the edge above zero you demand before taking the risk, and which Preferences from 6.1 raise or lower it.

Tie-breaking must be deterministic.

---

# 8A. Structure Definition Rules

A structure is a composed trade candidate with one or more legs.

A structure is not executable until its leg semantics, atomicity rule, pricing rule, and fallback behavior are explicit.

| Field                       | Definition                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure Type              | single-leg / vertical / calendar / diagonal / straddle / strangle / butterfly / ratio spread / custom                                              |
| Structure ID Rule           | deterministic ID rule for structure candidate                                                                                                      |
| Leg Definitions             | instrument, side, ratio, expiry, strike, option type, quantity rule                                                                                |
| Leg Role Rule               | long leg / short leg / hedge leg / financing leg / adjustment leg                                                                                  |
| Net Direction               | debit / credit / delta-positive / delta-negative / volatility-long / volatility-short / gamma-long / gamma-short / theta-positive / theta-negative |
| Structure Price Rule        | net price / per-leg price / mid / edge threshold / max debit / min credit                                                                          |
| Structure Cost Rule         | fees, spread, funding/carry, settlement cost, expected slippage                                                                                    |
| Structure Margin Rule       | required margin model and margin check trigger                                                                                                     |
| Structure Greek Rule        | required delta, gamma, vega, theta, rho, vanna, volga, or custom exposure constraints                                                              |
| Atomicity Rule              | all legs required / partial allowed / hedge-after-partial / cancel-all-on-fail                                                                     |
| Combo Order Required?       | yes / no / preferred / venue-dependent                                                                                                             |
| RFQ Required?               | yes / no / preferred / venue-dependent                                                                                                             |
| Legging Allowed?            | yes / no                                                                                                                                           |
| Legging Sequence Rule       | deterministic order of leg placement if combo unavailable                                                                                          |
| Leg Price Allocation Rule   | how net structure price is allocated across legs                                                                                                   |
| Partial Structure Behavior  | cancel remainder / complete hedge / reduce / fail / operator command                                                                               |
| Structure Invalidation Rule | when the whole structure becomes invalid before full execution                                                                                     |
| Structure Exit Rule         | exit as structure / exit legs independently / risk decides                                                                                         |
| Structure Adjustment Rule   | when legs may be rolled, resized, hedged, or replaced                                                                                              |
| Capability Fallback         | behavior if venue does not support combo, RFQ, batch, post-only, reduce-only, or amend                                                             |
| Failure Output              | `StructureReject` / `StructurePartial` / `StructureFailed`                                                                                         |

## Structure Leg Table

| Leg ID | Instrument Rule | Side | Ratio | Quantity Rule | Price Rule | Required? | Failure Behavior |
| ------ | --------------- | ---- | ----: | ------------- | ---------- | --------: | ---------------- |
|        |                 |      |       |               |            |           |                  |

## Structure Atomicity Rules

| Condition                                                | Required Behavior |
| -------------------------------------------------------- | ----------------- |
| One required leg rejected                                |                   |
| One required leg partially filled                        |                   |
| One optional leg rejected                                |                   |
| Combo unavailable                                        |                   |
| RFQ unavailable                                          |                   |
| Legging allowed but first leg fills and second leg fails |                   |
| Structure becomes invalid during placement               |                   |
| Risk rejects remaining leg after partial fill            |                   |
| Venue cancels one live leg                               |                   |
| Reconciliation finds orphan leg                          |                   |

No multi-leg candidate may be treated as a single executable order unless the venue capability map proves the required structure order is supported.

---

# 9. Entry Rules

Entry requires three answers (0.13):

Can it be done? (Impossible)

1. fresh required data
2. valid data quality
3. valid strategy instance state
4. executable instrument/venue state
5. declared structure semantics if multi-leg
6. declared execution placement policy
7. declared execution plan fallback behavior

Is it allowed? (Not allowed)

8. risk approval

Is it worth it? (Preference, judged through edge)

9. valid setup
10. valid signal
11. selected candidate ranks above No-Trade (8 Selection Rule)

| Field                    | Definition |
| ------------------------ | ---------- |
| Entry Method             |            |
| Entry Trigger            |            |
| Order Intent             |            |
| Order Type               |            |
| Time In Force            |            |
| Quantity Rule            |            |
| Price Rule               |            |
| Slippage Rule            |            |
| Fee / Funding Constraint |            |
| Cancel Rule              |            |
| Partial Fill Rule        |            |
| Capability Fallback      |            |

---

# 9A. Execution Placement Policy

Order placement must be defined explicitly.

A valid entry, exit, hedge, reduce, or adjustment intent is not executable until it resolves to a deterministic placement policy.

| Field                          | Definition                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Placement Objective            | maker-first / taker-first / minimize slippage / maximize fill probability / reduce-only / urgent exit / hedge completion |
| Placement Style                | single order / staged orders / quote-and-replace / sweep / RFQ / combo / venue-native strategy                           |
| Parent Intent Type             | entry / exit / hedge / reduce / adjustment / liquidation-defense                                                         |
| Parent Intent ID Rule          | deterministic parent ID used for audit and idempotency                                                                   |
| Order Decomposition Rule       | how parent intent becomes one or more child orders                                                                       |
| Child Order ID Rule            | deterministic child ID rule                                                                                              |
| Initial Price Rule             | how the first order price is computed                                                                                    |
| Initial Quantity Rule          | how the first order quantity is computed                                                                                 |
| Reprice Rule                   | when and how the order price changes                                                                                     |
| Resize Rule                    | when and how the remaining quantity changes                                                                              |
| Chase Rule                     | whether price may chase market movement, and within what limits                                                          |
| Spread Constraint              | maximum allowed spread or required book condition                                                                        |
| Book-Depth Constraint          | minimum visible depth required before placement                                                                          |
| Queue / Maker Constraint       | post-only required? maker preference? allowed taker fallback?                                                            |
| Taker Fallback Rule            | condition under which maker placement may cross the spread                                                               |
| Max Slippage Budget            | maximum total slippage allowed for the placement attempt                                                                 |
| Max Placement Duration         | maximum time before cancel, reprice, fallback, or fail                                                                   |
| Max Passive Wait               | maximum resting time before reprice or fallback                                                                          |
| Retry Rule                     | number of retries, spacing, and state reset behavior                                                                     |
| Cancel / Replace Rule          | when existing orders are cancelled and replaced                                                                          |
| Amend Rule                     | when venue-native amend may be used instead of cancel-replace                                                            |
| Partial Fill Continuation Rule | continue / resize / cancel remainder / hedge filled part / fail                                                          |
| Structure Placement Rule       | combo / RFQ / batch / legged sequence                                                                                    |
| Hedge Placement Rule           | passive / aggressive / urgent / reduce-only                                                                              |
| Exit Placement Rule            | passive / aggressive / structure-exit / leg-exit / risk-exit                                                             |
| Rate-Limit Behavior            | throttle / queue / fail / switch venue / reduce placement frequency                                                      |
| Venue Capability Fallback      | behavior if venue lacks required order type, post-only, reduce-only, RFQ, combo order, batch placement, or amend         |
| Idempotency Rule               | how duplicate placement commands are prevented                                                                           |
| Order-Linking Rule             | how child orders relate to parent intent, structure, hedge, or exit reason                                               |
| Unknown State Behavior         | recover / cancel / reconcile / block                                                                                     |
| Failure Output                 | `ExecutionReject` / `PlacementExpired` / `PlacementFailed` / `FallbackUsed`                                              |

Execution placement must not invent strategy logic.

It may only optimize how an already-approved intent is placed.

## Placement Decision Table

| Condition                             | Placement Behavior | Output |
| ------------------------------------- | ------------------ | ------ |
| Spread within limit and maker allowed |                    |        |
| Spread too wide                       |                    |        |
| Book depth insufficient               |                    |        |
| Post-only unavailable                 |                    |        |
| Combo unavailable                     |                    |        |
| RFQ unavailable                       |                    |        |
| Batch unavailable                     |                    |        |
| Amend unavailable                     |                    |        |
| Rate limit near breach                |                    |        |
| Placement duration exceeded           |                    |        |
| Partial fill received                 |                    |        |
| Signal expires during placement       |                    |        |
| Risk mode changes during placement    |                    |        |
| Venue rejects child order             |                    |        |
| Order state becomes unknown           |                    |        |

---

# 9B. Order Lifecycle Rules

Every order command must resolve through an explicit lifecycle.

| State            | Meaning                                                  | Allowed Next States                                                                   |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Planned          | execution created an order plan but has not emitted it   | Emitted / Rejected                                                                    |
| Emitted          | command sent to adapter                                  | Accepted / Rejected / Unknown                                                         |
| Accepted         | venue acknowledged order                                 | Open / Filled / PartiallyFilled / Cancelled / Expired                                 |
| Open             | live resting order exists                                | PartiallyFilled / Filled / CancelRequested / Cancelled / Replaced / Expired / Unknown |
| PartiallyFilled  | some quantity filled, remainder open or pending decision | Open / Filled / CancelRequested / Replaced / Failed / Unknown                         |
| CancelRequested  | cancel sent but not confirmed                            | Cancelled / Filled / PartiallyFilled / Unknown                                        |
| ReplaceRequested | replace or amend sent but not confirmed                  | Replaced / Open / Filled / PartiallyFilled / Rejected / Unknown                       |
| Replaced         | prior order replaced by a new child order                | terminal for old order                                                                |
| Filled           | full quantity filled                                     | terminal                                                                              |
| Rejected         | venue rejected order                                     | terminal                                                                              |
| Expired          | order expired by TIF or placement policy                 | terminal                                                                              |
| Unknown          | venue state unavailable or inconsistent                  | Recovering / Reconciled / Failed                                                      |
| Recovering       | recovery process is resolving truth                      | Reconciled / Failed                                                                   |
| Reconciled       | order state resolved from venue truth                    | terminal or restored state                                                            |
| Failed           | unrecoverable execution failure                          | terminal                                                                              |

No order state may be inferred from intent alone.

Venue truth, fill events, order events, or reconciliation must drive final state.

## Required Order Lifecycle Fields

| Field                       | Definition                           |
| --------------------------- | ------------------------------------ |
| Order ID Rule               |                                      |
| Client Order ID Rule        |                                      |
| Parent Intent ID            |                                      |
| Parent Structure ID         |                                      |
| Parent Strategy Instance ID |                                      |
| Venue Order ID Source       |                                      |
| State Owner                 | execution / adapter / reconciliation |
| Terminal States             |                                      |
| Retryable States            |                                      |
| Recoverable States          |                                      |
| Unknown State Timeout       |                                      |
| Cancel Confirmation Rule    |                                      |
| Replace Confirmation Rule   |                                      |
| Fill Application Rule       |                                      |
| Duplicate Event Rule        |                                      |
| Missing Event Rule          |                                      |
| Out-of-Order Event Rule     |                                      |

## Lifecycle Event Rules

| Event                               | Required State Transition |
| ----------------------------------- | ------------------------- |
| command planned                     |                           |
| command emitted                     |                           |
| venue accepted                      |                           |
| venue rejected                      |                           |
| order opened                        |                           |
| partial fill received               |                           |
| full fill received                  |                           |
| cancel requested                    |                           |
| cancel confirmed                    |                           |
| replace requested                   |                           |
| replace confirmed                   |                           |
| order expired                       |                           |
| order missing from venue snapshot   |                           |
| order found in venue snapshot       |                           |
| order state unknown after reconnect |                           |
| recovery resolved state             |                           |
| recovery failed                     |                           |

---

# 10. Exit Rules

Define all exit cases.

| Exit Type                | Condition | Action | Priority | Audit Reason |
| ------------------------ | --------- | ------ | -------: | ------------ |
| Profit Taking            |           |        |          |              |
| Stop Loss                |           |        |          |              |
| Invalidation Exit        |           |        |          |              |
| Time Exit                |           |        |          |              |
| Risk Exit                |           |        |          |              |
| Settlement / Expiry Exit |           |        |          |              |
| Operator Command Exit    |           |        |          |              |

Conflicting exits must resolve by priority.

## Exit Placement Requirements

Each exit must define whether it exits:

* entire structure
* selected legs
* hedge only
* exposure amount
* venue position
* strategy instance position
* account-level exposure

| Exit Type                | Structure Exit Rule | Placement Policy | Partial Exit Behavior | Failure Output |
| ------------------------ | ------------------- | ---------------- | --------------------- | -------------- |
| Profit Taking            |                     |                  |                       |                |
| Stop Loss                |                     |                  |                       |                |
| Invalidation Exit        |                     |                  |                       |                |
| Time Exit                |                     |                  |                       |                |
| Risk Exit                |                     |                  |                       |                |
| Settlement / Expiry Exit |                     |                  |                       |                |
| Operator Command Exit    |                     |                  |                       |                |

---

# 11. Risk Rules

| Rule                 | Limit | Applies To | Action On Breach | Target Mode |
| -------------------- | ----: | ---------- | ---------------- | ----------- |
| Max Risk Per Trade   |       |            |                  |             |
| Max Total Exposure   |       |            |                  |             |
| Max Open Structures  |       |            |                  |             |
| Max Position Size    |       |            |                  |             |
| Max Loss             |       |            |                  |             |
| Max Delta            |       |            |                  |             |
| Max Vega             |       |            |                  |             |
| Max Gamma            |       |            |                  |             |
| Max Margin Usage     |       |            |                  |             |
| Liquidation Distance |       |            |                  |             |
| Mode Switch Rule     |       |            |                  |             |

## Portfolio Allocation Rules

Risk limits are not sufficient without allocation.

The system must define how capital, margin, exposure, and order capacity are allocated across strategies, venues, accounts, structures, and hedges.

| Allocation Rule                 | Limit / Rule | Applies To | Action On Breach | Owner |
| ------------------------------- | -----------: | ---------- | ---------------- | ----- |
| Max Capital Per Strategy        |              |            |                  |       |
| Max Margin Per Strategy         |              |            |                  |       |
| Max Capital Per Venue           |              |            |                  |       |
| Max Margin Per Venue            |              |            |                  |       |
| Max Exposure Per Underlying     |              |            |                  |       |
| Max Exposure Per Expiry         |              |            |                  |       |
| Max Exposure Per Structure Type |              |            |                  |       |
| Max Shared Collateral Usage     |              |            |                  |       |
| Max Open Orders                 |              |            |                  |       |
| Max Open Orders Per Venue       |              |            |                  |       |
| Max Open Orders Per Strategy    |              |            |                  |       |
| Hedge Reserve Requirement       |              |            |                  |       |
| Emergency Exit Reserve          |              |            |                  |       |

---

# 12. Hedge Rules

| Field                       | Definition |
| --------------------------- | ---------- |
| Hedge Required?             |            |
| Hedge Instrument            |            |
| Hedge Exposure Metric       |            |
| Hedge Band                  |            |
| Rebalance Trigger           |            |
| Rebalance Size Rule         |            |
| Emergency Hedge Rule        |            |
| Hedge Unavailable Behavior  |            |
| Hedge Stop Condition        |            |
| Funding / Carry Constraint  |            |
| Hedge Placement Policy      |            |
| Hedge Partial Fill Behavior |            |
| Hedge Recovery Behavior     |            |

---

# 13. Reconciliation Rules

| Object             | Truth Source                | Reconciliation Trigger            | Mismatch Behavior |
| ------------------ | --------------------------- | --------------------------------- | ----------------- |
| Instrument catalog | venue / configured source   | startup, schedule, reconnect      |                   |
| Open orders        | venue                       | startup, reconnect, unknown order |                   |
| Fills              | venue fill history / stream | startup, reconnect, fill event    |                   |
| Positions          | venue position snapshot     | startup, schedule, after fills    |                   |
| Margin / balance   | venue account state         | startup, schedule, after fills    |                   |
| Hedge state        | book + venue position       | after hedge fill, schedule        |                   |

No mismatch may be silently overwritten.

---

# 13A. Recovery and In-Flight Command Rules

Recovery defines how the system resumes deterministic behavior after restart, reconnect, timeout, unknown order state, partial fill, interrupted placement, or adapter failure.

Recovery is not optional implementation detail.

| Recovery Case                               | Truth Source                                      | Required Behavior | Output |
| ------------------------------------------- | ------------------------------------------------- | ----------------- | ------ |
| Restart with no live orders                 | venue open orders + book state                    |                   |        |
| Restart with live orders                    | venue open orders + parent intent links           |                   |        |
| Restart with unknown orders                 | venue order history + client IDs + reconciliation |                   |        |
| Reconnect after missed order events         | venue open orders + order history                 |                   |        |
| Reconnect after missed fills                | venue fill history + book reconciliation          |                   |        |
| Placement command emitted but no ack        | client order ID lookup + venue order history      |                   |        |
| Cancel command emitted but no confirmation  | venue open orders + order history                 |                   |        |
| Replace command emitted but no confirmation | old order state + new order state                 |                   |        |
| Partial fill before cancel confirmation     | fill stream + venue order state                   |                   |        |
| Structure partially filled before failure   | venue fills + structure atomicity rule            |                   |        |
| Hedge partially filled before failure       | venue fills + hedge rule                          |                   |        |
| Unknown orphan venue order                  | venue open orders + configured ownership rule     |                   |        |
| Unknown orphan position                     | venue position snapshot + book state              |                   |        |
| Duplicate fill event                        | fill ID / trade ID / event ID                     |                   |        |
| Out-of-order event                          | sequence / timestamp / reconciliation             |                   |        |
| Adapter timeout                             | retry / lookup / recover / block                  |                   |        |
| Rate-limit interruption                     | queue / throttle / recover / fail                 |                   |        |

## In-Flight Command Requirements

| Field                 | Definition                                                               |
| --------------------- | ------------------------------------------------------------------------ |
| Command ID Rule       | deterministic command ID                                                 |
| Idempotency Key Rule  | prevents duplicate effect                                                |
| Parent Object         | signal / candidate / structure / order / hedge / exit / operator command |
| Command Owner         | execution / adapter / runtime / operator                                 |
| Persistence Point     | when command is persisted                                                |
| Emission Point        | when command leaves the system                                           |
| Ack Timeout Rule      |                                                                          |
| Retry Rule            |                                                                          |
| Lookup Rule           |                                                                          |
| Unknown Outcome Rule  |                                                                          |
| Recovery Owner        |                                                                          |
| Terminal Failure Rule |                                                                          |
| Audit Event           |                                                                          |

No in-flight command may disappear from the system without terminal state or recovery state.

---

# 14. Runtime Mode Rules

| Mode        | New Entry Allowed | Maintenance Allowed | Hedge Allowed | Exit Allowed | Notes |
| ----------- | ----------------: | ------------------: | ------------: | -----------: | ----- |
| BOOTING     |                no |                  no |            no |           no |       |
| NORMAL      |                   |                     |               |              |       |
| DEFEND      |                   |                     |               |              |       |
| REDUCE_ONLY |                   |                     |               |              |       |
| HALT        |                no |                     |               |              |       |
| RECOVERING  |                no |                     |               |              |       |
| SHUTDOWN    |                no |                  no |            no |              |       |

## Runtime Mode Execution Rules

| Mode        | Placement Allowed | Cancel Allowed | Replace Allowed | Recovery Allowed | Notes |
| ----------- | ----------------: | -------------: | --------------: | ---------------: | ----- |
| BOOTING     |                no |             no |              no |              yes |       |
| NORMAL      |                   |                |                 |                  |       |
| DEFEND      |                   |                |                 |                  |       |
| REDUCE_ONLY |                   |                |                 |                  |       |
| HALT        |                no |                |                 |                  |       |
| RECOVERING  |                no |                |                 |              yes |       |
| SHUTDOWN    |                no |                |                 |                  |       |

---

# 15. Conflict Rules

Default priority:

```text
Risk > System Mode > Freshness > Data Quality > Reconciliation State > Recovery State > Execution State > Strategy Instance State > Strategy > Optimization
```

Override this only with an explicit rule.

| Conflict | Priority Rule | Output |
| -------- | ------------- | ------ |
|          |               |        |

## Required Conflict Cases

| Conflict                                                     | Priority Rule                                                         | Output |
| ------------------------------------------------------------ | --------------------------------------------------------------------- | ------ |
| Strategy wants entry, risk rejects                           | risk wins                                                             |        |
| Strategy wants entry, runtime mode blocks entry              | runtime mode wins                                                     |        |
| Strategy wants entry, data fresh but invalid                 | data quality wins                                                     |        |
| Strategy wants entry, reconciliation unresolved              | reconciliation wins                                                   |        |
| Strategy wants entry, recovery in progress                   | recovery wins                                                         |        |
| Strategy wants entry, duplicate signal exists                | strategy instance state wins                                          |        |
| Execution wants placement, venue capability missing          | capability fallback rule wins                                         |        |
| Execution wants maker order, urgent risk exit requires taker | risk exit priority wins                                               |        |
| Execution wants replace, cancel already pending              | order lifecycle wins                                                  |        |
| Exit and hedge trigger at same time                          | risk / mode / configured priority wins                                |        |
| Structure partial fill conflicts with risk mode              | risk wins                                                             |        |
| Operator command conflicts with recovery                     | explicit operator command rule wins only if allowed transition exists |        |

---

# 16. Required Events and Audit

| Event                           | Producer                    | Required Fields                                                               | Used By                  |
| ------------------------------- | --------------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| SetupObserved                   | strategy                    |                                                                               |                          |
| SignalCreated                   | strategy                    |                                                                               |                          |
| CandidateSelected               | strategy                    |                                                                               |                          |
| CandidateRejected               | strategy / risk / execution | candidate id, stage, condition, role, observed value, threshold, distance from threshold | rejection funnel, spec correction |
| NoTradeSelected                 | strategy                    | best candidate id, edge after costs, required cushion, shortfall              | rejection funnel, spec correction |
| RiskDecisionRecorded            | risk                        |                                                                               |                          |
| ExecutionPlanCreated            | strategy / execution        |                                                                               |                          |
| OrderCommandEmitted             | execution                   |                                                                               |                          |
| OrderStateChanged               | adapter / execution         |                                                                               |                          |
| FillApplied                     | execution / book            |                                                                               |                          |
| ReconciliationCorrectionApplied | reconciliation / book       |                                                                               |                          |
| ModeChanged                     | runtime / risk              |                                                                               |                          |
| OperatorCommandAccepted         | operator interface          |                                                                               |                          |
| StrategyInstanceStateChanged    | strategy / runtime          | instance id, old state, new state, trigger, reason                            | audit, replay, recovery  |
| DataQualityRejected             | input owner                 | input, invalid condition, action, affected layer                              | audit, debugging         |
| StructureCreated                | strategy                    | structure id, legs, pricing rule, atomicity rule                              | audit, execution, risk   |
| StructureRejected               | strategy / risk / execution | structure id, reason, failed rule                                             | audit, debugging         |
| StructurePartiallyFilled        | execution / book            | structure id, filled legs, remaining legs, required behavior                  | risk, recovery           |
| StructureCompleted              | execution / book            | structure id, all filled legs, net price, cost                                | book, audit              |
| ExecutionPlacementSelected      | execution                   | parent intent, objective, placement policy, venue, fallback policy            | audit, replay, debugging |
| ChildOrderPlanned               | execution                   | parent intent, child order id, price rule, size rule, TIF, placement reason   | execution, audit         |
| OrderAccepted                   | adapter / execution         | order id, venue order id, timestamp                                           | lifecycle                |
| OrderRejected                   | adapter / execution         | order id, venue, reject reason, recoverability                                | lifecycle                |
| OrderOpened                     | adapter / execution         | order id, venue order id, live quantity, price                                | lifecycle                |
| OrderPartiallyFilled            | adapter / execution         | order id, fill id, fill quantity, fill price, remaining quantity              | book, lifecycle          |
| OrderFilled                     | adapter / execution         | order id, fill ids, total quantity, average price                             | book, lifecycle          |
| CancelRequested                 | execution                   | order id, reason, command id                                                  | lifecycle                |
| CancelConfirmed                 | adapter / execution         | order id, venue order id, remaining quantity                                  | lifecycle                |
| ReplaceRequested                | execution                   | old order id, new order id, reason, command id                                | lifecycle                |
| OrderRepriced                   | execution                   | order id, old price, new price, trigger, remaining quantity                   | audit, cost analysis     |
| OrderReplaced                   | adapter / execution         | old order id, new order id, venue order id                                    | lifecycle                |
| PlacementFallbackUsed           | execution                   | original policy, fallback policy, reason, capability gap                      | audit, spec correction   |
| PlacementExpired                | execution                   | parent intent, elapsed time, filled quantity, remaining quantity, final state | risk, strategy feedback  |
| PlacementFailed                 | execution                   | parent intent, venue, reason, recoverability, next allowed state              | runtime, recovery        |
| InFlightCommandRecorded         | execution / adapter         | command id, idempotency key, parent object, persistence point                 | recovery                 |
| InFlightCommandRecovered        | recovery                    | command id, recovered state, truth source, action                             | audit, replay            |
| RecoveryStarted                 | runtime / recovery          | reason, affected objects, blocked layers                                      | runtime                  |
| RecoveryCompleted               | runtime / recovery          | reason, resolved objects, final states                                        | runtime                  |
| RecoveryFailed                  | runtime / recovery          | reason, unresolved objects, required operator action                          | runtime, operator        |

Every event must be replayable.

Every state transition must be explainable from prior state plus event.

---

# 17. Build Outputs Expected From This Intent

| Output                        | Required? | Notes                                                   |
| ----------------------------- | --------: | ------------------------------------------------------- |
| StructuredTradingIntent       |       yes | seed for introduction/scope/terms                       |
| Component inventory           |       yes | venues, strategies, execution policies, books           |
| Required canonical types      |       yes | extracted type references                               |
| Required facts                |       yes | venue/instrument/market/account/cost facts              |
| Open decisions list           |       yes | blocks blueprint until resolved                         |
| Rejected ambiguity list       |       yes | vague or contradictory entries                          |
| Strategy instance state model |       yes | required for duplicate prevention and restart behavior  |
| Structure model               |       yes | required for options structures and multi-leg execution |
| Execution placement model     |       yes | required before order placement can be built            |
| Order lifecycle model         |       yes | required before execution can be built                  |
| Data quality model            |       yes | required before inputs can be trusted                   |
| Recovery model                |       yes | required before live runtime can be built               |
| Acceptance scenario pack      |       yes | required before implementation can be accepted          |
| Trading region evidence       |       yes | rejection funnel over historical and live data; observed pass rate per 6.1 condition; observed trade frequency |

---

# 17A. Build Acceptance Scenarios

A filled intent is not build-ready until it produces scenario tests.

Acceptance scenarios must prove that two independent builders would implement the same behavior.

## Required Scenario Groups

| Scenario Group             | Required? | Purpose                                                                          |
| -------------------------- | --------: | -------------------------------------------------------------------------------- |
| Setup scenarios            |       yes | prove setup detection and rejection                                              |
| Signal scenarios           |       yes | prove signal creation, expiry, invalidation, coexistence                         |
| Candidate scenarios        |       yes | prove deterministic candidate selection and ranking                              |
| Structure scenarios        |       yes | prove leg semantics, atomicity, partial behavior                                 |
| Risk scenarios             |       yes | prove approval, clipping, rejection, mode switch                                 |
| Entry scenarios            |       yes | prove entry requirements and blocking conditions                                 |
| Placement scenarios        |       yes | prove order placement behavior under venue constraints                           |
| Order lifecycle scenarios  |       yes | prove state transitions and terminal states                                      |
| Partial fill scenarios     |       yes | prove continuation, cancellation, hedge, or failure behavior                     |
| Exit scenarios             |       yes | prove exit priority and placement                                                |
| Hedge scenarios            |       yes | prove hedge trigger, sizing, placement, and recovery                             |
| Data quality scenarios     |       yes | prove invalid data handling                                                      |
| Reconciliation scenarios   |       yes | prove mismatch handling                                                          |
| Recovery scenarios         |       yes | prove restart, reconnect, timeout, unknown order, and in-flight command behavior |
| Runtime mode scenarios     |       yes | prove mode permissions                                                           |
| Conflict scenarios         |       yes | prove priority resolution                                                        |
| Operator command scenarios |       yes | prove explicit intervention and audit                                            |
| No-trade scenarios         |       yes | prove correct non-action                                                         |
| Trade scenarios            |       yes | prove the system trades when the market idea is present                          |

## Scenario Template

| Field                           | Definition  |
| ------------------------------- | ----------- |
| Scenario ID                     |             |
| Scenario Name                   |             |
| Given State                     |             |
| Given Inputs                    |             |
| Given Venue State               |             |
| Given Runtime Mode              |             |
| Given Strategy Instance State   |             |
| Event / Trigger                 |             |
| Expected Setup Output           |             |
| Expected Signal Output          |             |
| Expected Candidate Output       |             |
| Expected Risk Output            |             |
| Expected Execution Output       |             |
| Expected Order Lifecycle Output |             |
| Expected Book Output            |             |
| Expected Runtime Output         |             |
| Expected Audit Events           |             |
| Forbidden Outputs               |             |
| Acceptance Result               | pass / fail |

## Minimum Required Acceptance Scenarios

| Scenario                                     | Required Behavior                               |
| -------------------------------------------- | ----------------------------------------------- |
| Valid setup but missing required input       | no setup / no trade                             |
| Valid setup but invalid data quality         | reject / block according to data quality rule   |
| Valid signal but duplicate signal exists     | instance state rule decides                     |
| Valid candidate but risk rejects             | no execution                                    |
| Valid candidate but venue capability missing | fallback or reject according to capability rule |
| Multi-leg structure with combo support       | structure placement follows combo rule          |
| Multi-leg structure without combo support    | fallback follows legging rule or rejects        |
| First leg fills and second leg fails         | atomicity rule decides                          |
| Maker-first placement fills passively        | lifecycle reaches filled                        |
| Maker-first placement expires                | placement expiry behavior applies               |
| Maker-first placement falls back to taker    | taker fallback rule applies                     |
| Order accepted then partially filled         | partial fill continuation rule applies          |
| Cancel requested while partial fill arrives  | lifecycle rule resolves state                   |
| Replace requested but venue response missing | recovery rule resolves state                    |
| Restart with live open order                 | recovery restores or cancels by rule            |
| Reconnect after missed fills                 | reconciliation applies fills once               |
| Unknown orphan order found                   | recovery / operator rule resolves               |
| Risk mode changes during placement           | placement stops, reduces, or exits by rule      |
| Exit and hedge trigger together              | conflict priority decides                       |
| Data fresh but crossed book                  | data quality blocks or degrades                 |
| Fee schedule unavailable                     | cost rule blocks trading                        |
| Runtime mode is HALT                         | new entry blocked                               |
| Runtime mode is RECOVERING                   | recovery allowed, new entry blocked             |
| Operator command issued                      | allowed transition and audit required           |
| Representative market where the idea is present | entry proceeds                               |
| One Preference unfavourable, edge still clears cushion | entry proceeds (cushion, size, or rank adjusted) |
| Edge after costs below cushion               | `NoTradeSelected` with shortfall recorded        |

---

# 18. Final Build Readiness Check

Can two independent engineers build the same trading behavior from this?

* YES
* NO

If NO, list missing definitions:

| Missing Definition | Blocks Which Layer | Owner |
| ------------------ | ------------------ | ----- |
|                    |                    |       |

## Required Readiness Gates

| Gate                                         | Pass? | Missing Definitions |
| -------------------------------------------- | ----: | ------------------- |
| Universe defined                             |       |                     |
| Strategy identity defined                    |       |                     |
| Core market idea defined                     |       |                     |
| Observable behavior defined                  |       |                     |
| Inputs defined                               |       |                     |
| Data quality rules defined                   |       |                     |
| Setup rules defined                          |       |                     |
| Strategy instance state rules defined        |       |                     |
| Signal rules defined                         |       |                     |
| Candidate rules defined                      |       |                     |
| Structure rules defined                      |       |                     |
| Entry rules defined                          |       |                     |
| Execution placement policy defined           |       |                     |
| Order lifecycle rules defined                |       |                     |
| Exit rules defined                           |       |                     |
| Risk rules defined                           |       |                     |
| Portfolio allocation rules defined           |       |                     |
| Hedge rules defined                          |       |                     |
| Reconciliation rules defined                 |       |                     |
| Recovery and in-flight command rules defined |       |                     |
| Runtime mode rules defined                   |       |                     |
| Conflict rules defined                       |       |                     |
| Required events defined                      |       |                     |
| Acceptance scenarios defined                 |       |                     |
| Condition roles declared (6.1)               |       |                     |
| Edge, costs, and cushion defined (8)         |       |                     |
| Trading region non-empty                     |       |                     |

The intent is build-ready only when every required gate passes.

Trading region non-empty passes when trade frequency observed on historical data falls within the declared Expected Trade Frequency (2). If it does not, the rejection funnel (17) shows which stage empties the region. Fix that stage by reclassifying conditions or revising the idea or mandate, not by adjusting thresholds one at a time.
