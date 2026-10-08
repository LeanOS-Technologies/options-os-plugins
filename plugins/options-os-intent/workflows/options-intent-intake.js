export const meta = {
  name: 'options-intent-intake',
  description: 'Draft a complete Options OS intent from a strategy idea or proposal by section owners in parallel, challenge it, and return the draft, open decisions and questions for the trader.',
  whenToUse: 'Use when a trader has a concrete crypto-options strategy (or a confirmed proposal from options-strategy-research) and wants an intent ready to enter Options OS.',
  phases: [
    { title: 'Draft', detail: 'section owners propose fields and open decisions in parallel' },
    { title: 'Challenge', detail: 'evidence and scenarios, plus three cross-section challengers' },
    { title: 'Assemble', detail: 'one intent in the template with confirmed, proposed and unresolved fields' },
  ],
}

const input = typeof args === 'string' ? { idea: args } : (args || {})
if (!input.idea && !input.proposal) throw new Error('options-intent-intake requires args.idea or args.proposal. With no concrete strategy, run options-strategy-research first.')
const SKILLS = input.skillsDir || '<skills-dir>'
const LOCATE = input.skillsDir ? '' : '\n- <skills-dir> is the directory that holds the skill folders. Find it with a file search for **/skills/opportunity-researcher/SKILL.md (installed plugin or repository checkout) and use that file\'s grandparent directory.'
const TEMPLATE = input.templatePath || 'specifications/_framework/directive/intent.md (Options OS, if present in the workspace), otherwise ' + SKILLS + '/intent-intake-workflow/inputs/intent-template.md'

const RULES = `Rules for every step:
- Read the whole intent template first: ${TEMPLATE}. Keep its section structure and terms.
- Domain intelligence lives in ${SKILLS}/<skill>/SKILL.md. Read the skills named for your task in full and apply them.${LOCATE}
- Field status is exactly one of: confirmed (stated by the trader in the input), proposed (your domain-reasoned proposal, with rationale), unresolved (needs a trader decision). Only the trader input can make a field confirmed.
- Never invent capital, limits, venues, access, thresholds or trading rules; leave them unresolved. Never copy template example values as answers.
- Define every vague term the template forbids as an observable rule, or leave it unresolved. Every condition has one role (Impossible, Not allowed, Preference); default to Preference and justify any veto.
- Open decisions carry choices with their consequences and an owner.
- Never claim profitability or verification. This is engineering input, not trading advice.
- Trader idea: ${input.idea ? (typeof input.idea === 'string' ? input.idea : JSON.stringify(input.idea)) : 'none'}
- Confirmed strategy proposal: ${input.proposal ? (typeof input.proposal === 'string' ? input.proposal : JSON.stringify(input.proposal)) : 'none'}
- Trader-confirmed decisions so far: ${input.confirmed ? (typeof input.confirmed === 'string' ? input.confirmed : JSON.stringify(input.confirmed)) : 'none'}
- Existing partly filled intent: ${input.existingIntent ? input.existingIntent : 'none'}`

const GROUPS = [
  { key: 'venue', skills: ['venue-truth-seeker'], sections: '1 Trading Universe, 5.2 Venue State Inputs, 9B Order Lifecycle Rules, 13 Reconciliation Rules, 13A Recovery and In-Flight Command Rules', after: false },
  { key: 'data', skills: ['surface-builder'], sections: '5.1 Market Data Inputs, 5.3 Derived Inputs, 5.4 Data Quality Rules, shared conventions (unit of account, Greek definitions, smile-dynamics rule)', after: false },
  { key: 'economics', skills: ['premium-seeker'], sections: '2 Strategy Identity, 3 Core Market Idea, 4 Observable Market Behavior, 6 Setup, 6.1 Condition Role Table, 7 Signal, 8 Candidate and Selection (edge, costs, cushion), 10 Exit Rules. Apply premium-seeker where the strategy sells premium; otherwise derive the economics with the same discipline (buyer and bad state, executable net economics, tail, decay) and say so', after: false },
  { key: 'execution', skills: ['fill-seeker', 'venue-truth-seeker'], sections: '8A Structure Definition, 9 Entry Rules, 9A Execution Placement Policy', after: false },
  { key: 'risk', skills: ['survival-keeper'], sections: '11 Risk Rules and Portfolio Allocation, 14 Runtime Mode Rules', after: false },
  { key: 'hedge', skills: ['options-hedger', 'surface-builder'], sections: '12 Hedge Rules', after: false },
]

const DRAFT = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', properties: {
      section: { type: 'string' },
      fields: { type: 'array', items: { type: 'object', properties: {
        field: { type: 'string' }, value: { type: 'string' },
        status: { type: 'string', enum: ['confirmed', 'proposed', 'unresolved'] }, rationale: { type: 'string' } },
        required: ['field', 'value', 'status'] } } },
      required: ['section', 'fields'] } },
    openDecisions: { type: 'array', items: { type: 'object', properties: {
      section: { type: 'string' }, question: { type: 'string' }, owner: { type: 'string' },
      choices: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, consequence: { type: 'string' } }, required: ['label', 'consequence'] } } },
      required: ['section', 'question', 'owner', 'choices'] } },
    contradictions: { type: 'array', items: { type: 'string' } },
  },
  required: ['group', 'sections', 'openDecisions', 'contradictions'],
}

const FINDINGS = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: {
      section: { type: 'string' }, problem: { type: 'string' }, whyItMatters: { type: 'string' }, question: { type: 'string' } },
      required: ['section', 'problem', 'whyItMatters'] } },
  },
  required: ['lens', 'findings'],
}

const EVIDENCE = {
  type: 'object',
  properties: {
    sections: DRAFT.properties.sections,
    openDecisions: DRAFT.properties.openDecisions,
    gates: { type: 'array', items: { type: 'object', properties: {
      gate: { type: 'string' }, pass: { type: 'boolean' }, missing: { type: 'string' }, owner: { type: 'string' } },
      required: ['gate', 'pass', 'missing'] } },
  },
  required: ['sections', 'openDecisions', 'gates'],
}

if (input.dryRun) {
  return { dryRun: true, skillsDir: SKILLS, groups: GROUPS.map(g => g.key), agentEstimate: GROUPS.length + 1 + 3 + 1 }
}

phase('Draft')
const drafts = (await pipeline(GROUPS,
  g => agent(`${RULES}\n\nSection owner: ${g.key}. Read: ${g.skills.map(s => `${SKILLS}/${s}/SKILL.md`).join(', ')}.\nSections you own: ${g.sections}.\nFor each field of your sections give a status and value. Find missing decisions, contradictions and vague terms. Return the next open decisions, highest impact first, each with choices and consequences.`,
    { label: `draft:${g.key}`, phase: 'Draft', schema: DRAFT }))).filter(Boolean)
log(`${drafts.length}/${GROUPS.length} section groups drafted; ${drafts.reduce((n, d) => n + d.openDecisions.length, 0)} open decisions raised`)

phase('Challenge')
const CHALLENGERS = [
  { key: 'determinism-and-vague-terms', ask: 'Check template sections 0.1, 4 and 5.4: would two independent engineers build the same behavior? Find vague terms still undefined, unobservable conditions, and missing invalid-data rules.' },
  { key: 'roles-and-trading-region', ask: 'Check template sections 0.13 and 6.1: find vetoes that are really preferences, a stack of conditions that leaves the trading region empty, missing role justifications, and Expected Trade Frequency that the conditions cannot meet.' },
  { key: 'risk-recovery-consistency', ask: 'Check consistency across risk, hedge, execution, recovery and mode sections: delta and unit conventions on inverse books, atomicity against real venue guarantees, partial-fill states against risk policy, hedge limits inside hard limits, joint stress and venue-halt coverage, conflict priority.' },
]
const [evidence, ...challenges] = await parallel([
  () => agent(`${RULES}\n\nSection owner: evidence. Read: ${SKILLS}/attributor/SKILL.md.\nSections you own: 6.1 Expected Pass Rate column, 16 Required Events and Audit, 17 Build Outputs, 17A Build Acceptance Scenarios, 18 Final Build Readiness Check.\nUse the drafts below. Gates that need recorded-market evidence, such as Trading region non-empty, must not be marked passed: mark them unresolved with owner and the evidence required.\nDrafts:\n${JSON.stringify(drafts)}`,
    { label: 'draft:evidence', phase: 'Challenge', schema: EVIDENCE }),
  ...CHALLENGERS.map(c => () => agent(`${RULES}\n\nChallenger lens: ${c.key}. ${c.ask}\nRead the specialist skills you need under ${SKILLS}. Return only real problems, each with the affected section, why it matters and the question for the trader.\nDrafts:\n${JSON.stringify(drafts)}`,
    { label: `challenge:${c.key}`, phase: 'Challenge', schema: FINDINGS })),
])
const findings = challenges.filter(Boolean)
log(`evidence stage ${evidence ? 'done' : 'failed'}; ${findings.reduce((n, f) => n + f.findings.length, 0)} challenger findings`)

phase('Assemble')
const intent = await agent(`${RULES}\n\nAssemble the intent. Produce ONE document in the template's own structure and section numbering, with every field marked confirmed, proposed or unresolved. Do not drop template sections; keep fixed principles and defaults unless the trader's input contradicts them. Resolve duplicate or conflicting drafts by flagging the conflict, not by choosing silently. Apply the challenger findings: change a proposal or raise an open decision, never resolve a trader-owned decision. Fill section 18 from the evidence stage honestly.\nThen append: (a) unresolved decisions list with owners, (b) contradictions found, (c) the three most useful questions to ask the trader next, each with choices and consequences, (d) next action.\nSection drafts:\n${JSON.stringify(drafts)}\nEvidence stage:\n${JSON.stringify(evidence)}\nChallenger findings:\n${JSON.stringify(findings)}`,
  { label: 'assemble', phase: 'Assemble' })

return { intentMarkdown: intent, gates: evidence ? evidence.gates : null,
  openDecisions: [...drafts.flatMap(d => d.openDecisions), ...(evidence ? evidence.openDecisions : [])],
  challengerFindings: findings,
  next: 'Present the draft and the top questions to the trader, record the answers as confirmed, and re-run with args.confirmed or continue interactively with the intent-intake-workflow skill. Write the intent to a file only when the trader asks.' }
