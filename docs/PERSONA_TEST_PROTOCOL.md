# AquaPriority MX — Fresh-Chat Persona Test Protocol

## Boundary

This is a synthetic usability exercise, not field research and not evidence of municipal outcomes. Responses must come from a separate fresh conversation after showing actual deployed-product screenshots in order. Do not invent, prefill, or rewrite the persona's observations.

## Synthetic persona

Elena is a fictional 46-year-old municipal water-maintenance coordinator. She uses spreadsheets and repair tickets daily, works under time pressure, and is not an advanced AI user. She must never confuse a suspected incident with a verified repair, and she knows qualified field staff retain authority.

## Exact task for the fresh chat

> You are Elena, a fictional municipal water-maintenance coordinator. Review the attached AquaPriority MX screenshots in the exact order provided. Choose which fictional case should receive human inspection review next. Narrate each hesitation, misunderstanding, and point where you might give up. Explain whether you can distinguish the spreadsheet baseline, transparent rules, experimental ML signal, and the four evidence statuses. Do not assume controls work unless their behavior is visible. This is a synthetic usability test, not real user research.

## Screenshot sequence

1. `01-baseline.png` — opening view, banner, map, and basic sheet order.
2. `02-rules.png` — transparent rule ordering and selected case explanation.
3. `03-ml.png` — experimental model signal, measured synthetic metrics, and limitation.
4. `04-incomplete.png` — incomplete/unreliable sensing showing `REVIEW REQUIRED` and `ML UNAVAILABLE`.
5. `05-human-review.png` — qualified role, rationale/evidence, explicit confirmation, status gate, and local-history disclaimer.

Show one image at a time. Ask the persona to react before sending the next image. Preserve every response verbatim and in order.

## Questions

1. What do you believe the page is asking you to decide?
2. Which case would you review next, and which visible evidence supports that choice?
3. What is the difference between sheet rank, rule rank, and the ML signal?
4. Does any part appear to authorize dispatch, excavation, repair, or verification automatically?
5. What does `REPAIRED` mean here, and how does it differ from `OUTCOME_VERIFIED`?
6. What feels slow, ambiguous, overly technical, or unsafe?
7. Where would you stop or ask another person for help?

## Confusion log

| Order | Screenshot | Exact observation | Severity | Task impact | Evidence | Candidate fix |
|---:|---|---|---|---|---|---|
| 1 | | | Critical / High / Medium / Low | | Exact persona text | |

Record every confusion, even if it is not selected for repair. Do not convert silence into approval.

## Fix prioritization

Fix the highest item by this order:

1. Could cause a suspected case to be mistaken for confirmed, repaired, or verified.
2. Could make ML/rules appear autonomous or authoritative.
3. Prevents choosing the next inspection-review case.
4. Hides uncertainty, missing evidence, or equity context.
5. Creates substantial navigation or comprehension delay.
6. Cosmetic preference only.

If two issues tie, fix the one affecting more screenshots or core task steps. Create a test where practical, redeploy, repeat the affected screenshot/task, and preserve before/after evidence. Persona feedback and the resulting correction remain pending until the separate fresh-chat exercise is actually performed.
