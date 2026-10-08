export const meta = {
  name: 'options-strategy-research',
  description: 'Research crypto-options opportunities online from sourced, dated facts and propose one strategy after adversarial checks.',
  whenToUse: 'Use when a trader has no concrete crypto-options strategy yet, or wants alternatives compared before writing an Options OS intent.',
  phases: [
    { title: 'Research', detail: 'parallel online lenses, each returning sourced and dated facts' },
    { title: 'Candidates', detail: 'independent candidate generation from the research' },
    { title: 'Evaluate', detail: 'economics and feasibility per candidate, then three adversarial lenses' },
    { title: 'Propose', detail: 'synthesize one proposal and critique its completeness' },
  ],
}

const input = typeof args === 'string' ? { brief: args } : (args || {})
if (!input.brief) throw new Error('options-strategy-research requires args.brief: the trader starting point (underlying, venues, horizon, style, constraints). Unknown stays unknown.')
const SKILLS = input.skillsDir || '<skills-dir>'
const LOCATE = input.skillsDir ? '' : '\n- <skills-dir> is the directory that holds the skill folders. Find it with a file search for **/skills/opportunity-researcher/SKILL.md (installed plugin or repository checkout) and use that file\'s grandparent directory.'
const MAX_CANDIDATES = input.maxCandidates || 6

const RULES = `Rules for every step:
- Domain intelligence lives in skill files under ${SKILLS}/<skill>/SKILL.md. Read the ones named for your task in full and apply them; do not rely on memory of crypto-options facts.${LOCATE}
- Fetch, then reason. Rank sources: primary venue sources, primary data, institutional research and data vendors, academic work, then social media and aggregators as leads only. Every fact carries source URL, scope and date. Mark anything not traced to a primary source as unverified.
- Never fabricate quotes, results, completed probes or calibrated parameters. Never invent capital, limits, venues or access. Unknown inputs stay symbolic or unresolved.
- Evidence status per claim is one of: hypothesis, specified, measured, validated, inconclusive, infeasible_within_scope.
- Never claim profitability. This is engineering research, not trading advice.
- Trader brief: ${typeof input.brief === 'string' ? input.brief : JSON.stringify(input.brief)}
- Mandate-level facts supplied (capital, limits, access): ${input.mandate ? JSON.stringify(input.mandate) : 'none supplied'}`

const LENSES = [
  { key: 'venue-map', skills: ['opportunity-researcher', 'venue-truth-seeker'],
    focus: 'Rebuild the venue map from primary sources: venue classes, underlyings, payoff and collateral, exercise style, settlement, margin model, fees and caps, liquidity access (book, RFQ, block), hours, jurisdiction and access limits. Treat remembered figures as dated leads.' },
  { key: 'premium-and-surface', skills: ['premium-seeker', 'surface-builder', 'opportunity-researcher'],
    focus: 'Find measured evidence on variance, skew, term and event premia for the underlying in the brief: definitions used, horizon, estimator, period, distribution of outcomes (negative fraction, worst cases), and what is only an ATM proxy.' },
  { key: 'flow-and-supply', skills: ['premium-seeker', 'opportunity-researcher'],
    focus: 'Map who sells and who buys volatility: vaults and income protocols, exchange structured products, ETF overwriting, market makers, block tapes, plus leverage indicators (funding, basis, open interest). Identify where supply is compressing premium and where it is not.' },
  { key: 'execution-and-costs', skills: ['fill-seeker', 'options-hedger', 'venue-truth-seeker'],
    focus: 'Establish the realistic cost of expressing and hedging candidate structures: fee caps relative to premium, spreads and depth by moneyness and tenor, RFQ and block availability, combo support and fill reporting, perpetual funding and hedge-instrument cost.' },
  { key: 'tail-and-margin', skills: ['survival-keeper', 'premium-seeker'],
    focus: 'Establish tail and survivability inputs: documented crash and cascade episodes affecting options books, venue failure and withdrawal-suspension precedents, margin models and collateral haircuts on the relevant venues, liquidation and auto-deleveraging rules.' },
]

const FACTS = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    facts: { type: 'array', items: { type: 'object', properties: {
      claim: { type: 'string' }, source: { type: 'string' }, sourceTier: { type: 'integer' },
      scope: { type: 'string' }, date: { type: 'string' }, verified: { type: 'boolean' } },
      required: ['claim', 'source', 'scope', 'date', 'verified'] } },
    conflicts: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
  },
  required: ['lens', 'facts', 'conflicts', 'gaps'],
}

const CANDIDATES = {
  type: 'object',
  properties: { candidates: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, name: { type: 'string' }, edgeClass: { type: 'string' },
    mechanism: { type: 'string' }, counterparty: { type: 'string' },
    expression: { type: 'string' }, venues: { type: 'string' }, assumptions: { type: 'string' } },
    required: ['id', 'name', 'edgeClass', 'mechanism', 'counterparty', 'expression', 'venues', 'assumptions'] } } },
  required: ['candidates'],
}

const EVAL = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    netEconomics: { type: 'string' }, evidenceStatus: { type: 'string' },
    tailAndStress: { type: 'string' }, capitalAndFeasibility: { type: 'string' },
    hedgeAndExecution: { type: 'string' }, capacityAndDecay: { type: 'string' },
    killCriteria: { type: 'string' }, discriminatingTest: { type: 'string' },
    openInputs: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'netEconomics', 'evidenceStatus', 'tailAndStress', 'capitalAndFeasibility', 'hedgeAndExecution', 'capacityAndDecay', 'killCriteria', 'discriminatingTest', 'openInputs'],
}

const VERDICT = {
  type: 'object',
  properties: { refuted: { type: 'boolean' }, reason: { type: 'string' }, requiredFix: { type: 'string' } },
  required: ['refuted', 'reason'],
}

if (input.dryRun) {
  return { dryRun: true, skillsDir: SKILLS, lenses: LENSES.map(l => l.key), maxCandidates: MAX_CANDIDATES,
    agentEstimate: LENSES.length + 3 + MAX_CANDIDATES * 4 + 2 }
}

phase('Research')
const facts = (await pipeline(LENSES,
  l => agent(`${RULES}\n\nResearch lens: ${l.key}.\nRead these skills: ${l.skills.map(s => `${SKILLS}/${s}/SKILL.md`).join(', ')}.\nTask: ${l.focus}\nUse WebSearch and WebFetch. Return sourced, dated facts, conflicts between sources (do not average them), and gaps.`,
    { label: `research:${l.key}`, phase: 'Research', schema: FACTS }))).filter(Boolean)
log(`${facts.length}/${LENSES.length} research lenses returned; ${facts.reduce((n, f) => n + f.facts.length, 0)} facts`)

phase('Candidates')
const ANGLES = [
  { key: 'risk-premia', prompt: 'Generate candidates whose edge is compensation for bearing a risk others want to shed (variance, skew, term, event, carry). Use the premium menu and wing economics.' },
  { key: 'flow-and-venue', prompt: 'Generate candidates whose edge comes from structural flow, venue microstructure, margin or fee differences, or outcome-market divergence.' },
  { key: 'model-and-event', prompt: 'Generate candidates whose edge comes from a better model of the underlying (jumps, spot-vol regime, weekend effects, event variance). Be explicit that a model edge is the easiest to fool yourself on.' },
]
const generated = (await parallel(ANGLES.map(a => () =>
  agent(`${RULES}\n\nRead: ${SKILLS}/opportunity-researcher/SKILL.md and ${SKILLS}/premium-seeker/SKILL.md.\nAngle: ${a.key}. ${a.prompt}\nFor every candidate state the counterparty sentence: the other side is X, they accept this price because Y, and this persists until Z.\nResearch facts:\n${JSON.stringify(facts)}`,
    { label: `candidates:${a.key}`, phase: 'Candidates', schema: CANDIDATES })))).filter(Boolean)
const seen = new Set()
const distinct = []
for (const c of generated.flatMap(g => g.candidates)) {
  const k = c.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  if (!seen.has(k)) { seen.add(k); distinct.push(c) }
}
const candidates = distinct.slice(0, MAX_CANDIDATES)
if (distinct.length > MAX_CANDIDATES) log(`Candidate cap: evaluating ${MAX_CANDIDATES} of ${distinct.length}; not evaluated: ${distinct.slice(MAX_CANDIDATES).map(c => c.name).join('; ')}`)
log(`${candidates.length} distinct candidates after deduplication`)

phase('Evaluate')
const LENSES_ADV = [
  { key: 'mechanism-and-decay', ask: 'Is the counterparty mechanism real, and is the decay condition known? Is any "edge" just an unpriced risk premium or a constraint not yet priced?' },
  { key: 'executable-economics', ask: 'Does the edge survive executable prices, fee caps, half-spreads, hedge cost and capital cost? Does it rely on marks, mids or fitted values?' },
  { key: 'tail-and-feasibility', ask: 'Does the joint-stress loss fit a plausible mandate, are margin and collateral treated per venue, and is the structure executable (combo, RFQ, legging) without naked intermediate states?' },
]
const evaluated = (await pipeline(candidates,
  c => agent(`${RULES}\n\nRead: ${['premium-seeker', 'opportunity-researcher', 'survival-keeper', 'options-hedger', 'fill-seeker'].map(s => `${SKILLS}/${s}/SKILL.md`).join(', ')}.\nEvaluate this candidate. Use symbolic parameters where capital or limits are unknown. Express economics in a stated numeraire and horizon.\nCandidate:\n${JSON.stringify(c)}\nResearch facts:\n${JSON.stringify(facts)}`,
    { label: `evaluate:${c.id}`, phase: 'Evaluate', schema: EVAL }),
  async (ev, c) => {
    const votes = (await parallel(LENSES_ADV.map(l => () =>
      agent(`${RULES}\n\nTry to refute this candidate through the "${l.key}" lens. ${l.ask} Default to refuted=true if uncertain or if evidence is missing for a claim the case depends on.\nCandidate:\n${JSON.stringify(c)}\nEvaluation:\n${JSON.stringify(ev)}`,
        { label: `refute:${c.id}:${l.key}`, phase: 'Evaluate', schema: VERDICT })))).filter(Boolean)
    const standing = votes.filter(v => !v.refuted).length
    return { candidate: c, evaluation: ev, votes, survives: votes.length >= 2 && standing >= 2 }
  })).filter(Boolean)
log(`${evaluated.filter(e => e.survives).length}/${evaluated.length} candidates survive adversarial checks`)

phase('Propose')
const proposal = await agent(`${RULES}\n\nRead: ${SKILLS}/opportunity-researcher/SKILL.md and ${SKILLS}/premium-seeker/SKILL.md.\nWrite the strategy proposal as markdown. Recommend one preferred strategy among candidates that survived, or an evidenced finding that the searched set is infeasible under the stated constraints. Rank only comparable estimates; otherwise rank research priority and say so.\nInclude: candidates considered and why kept or set aside (with the refutations); the preferred strategy (mechanism and class, counterparty sentence, expression and alternatives, venues and access, net economics in a stated numeraire and horizon, stress and tail, capital and feasibility, hedge and execution notes, capacity, decay metric, kill criteria, cheapest discriminating test); evidence status per claim; a source log with source, scope and date; proposed values for the intent fields universe, identity, market idea and observables, each marked proposed; open decisions belonging to the mandate owner.\nEvaluated candidates:\n${JSON.stringify(evaluated)}\nResearch facts, conflicts and gaps:\n${JSON.stringify(facts)}`,
  { label: 'propose', phase: 'Propose' })
const critique = await agent(`${RULES}\n\nCompleteness critic. Read the proposal and the research below. List what is missing: lenses not run, claims without a primary source, candidate classes not considered, venue facts not refreshed, stress cases absent. Return a short bullet list; do not rewrite the proposal.\nProposal:\n${proposal}\nResearch gaps reported:\n${JSON.stringify(facts.map(f => ({ lens: f.lens, gaps: f.gaps, conflicts: f.conflicts })))}`,
  { label: 'completeness-critic', phase: 'Propose' })

return { proposal, completenessCritique: critique, survivors: evaluated.filter(e => e.survives).map(e => e.candidate.name), refuted: evaluated.filter(e => !e.survives).map(e => ({ name: e.candidate.name, votes: e.votes })),
  next: 'Present the proposal to the trader. Only after the trader confirms a strategy, continue with intent-intake (workflow options-intent-intake or the intent-intake-workflow skill).' }
