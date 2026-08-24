# SeniorHelpersIL

Illinois-focused senior help station, concierge, Action Plan, and member profile MVP.

## Current experience

- Concierge-only interface designed for older adults.
- Five help areas: Food, Housing, Bills, Money & Benefits, and Healthcare.
- Short guided journey: choose help, enter ZIP, answer optional Medicare/Medicaid questions when relevant, review answers, see the Action Plan.
- Illinois ZIP is the only universal required routing field.
- No urgency questionnaire and no age question before recommendations.
- Large readable controls and plain-language prompts.
- One primary recommendation is shown first; secondary help stays collapsed.
- Profile creation comes after useful answers and is optional.
- Optional member profile. Only a name is required to create it.
- Human help remains an optional escalation rather than a required step.

## Guided Health Profile

Inside **My Profile**, members can choose **Set up my health profile**.

The Health Profile is intentionally optional and is designed as a future Medicare-comparison preference profile rather than a medical record. Members may complete as much or as little as they want.

The guided flow includes:

1. Current Medicare coverage and optional plan name.
2. Doctors the member would like to keep.
3. Prescriptions, with optional dosage, frequency, and quantity.
4. Preferred pharmacies, including retail or mail-order preference.
5. Preferred hospitals or health systems.
6. Coverage priorities such as keeping doctors, lowering prescription costs, total yearly cost, premium, network breadth, dental, vision, hearing, OTC/grocery benefits, transportation, fitness, and travel flexibility.
7. A review screen with edit links for every section.

Every intake section supports **Skip for now**. Doctors, prescriptions, pharmacies, and hospitals support multiple entries. Progress saves to the member profile as the user goes.

The member profile then shows a compact summary of how many health-profile areas have been added and allows direct editing of any area.

## Medicare comparison direction

The current Health Profile does not rank live Medicare plans. It stores the inputs that would later drive a transparent comparison engine.

The intended future comparison uses the member's current plan as the baseline and considers:

- Doctor and hospital fit.
- Prescription coverage and estimated drug costs.
- Pharmacy preference.
- Premium and expected yearly cost.
- Network structure.
- Benefits the member actually values.

Changing plans should only be recommended when the alternative improves the member's situation.

## Recommendation engine

`resource-engine.js` contains the current Illinois assistance recommendation logic and trusted program destinations.

The engine is intentionally rule-based and transparent. It uses selected help areas, Illinois ZIP, optional Medicare/Medicaid answers, and saved profile information when available.

## Product principles

- Give useful answers before asking for optional personal information.
- Plain language and short sentences.
- One decision at a time.
- One primary action per topic.
- Optional details stay optional.
- No account required to see assistance.
- Help low-income Illinois seniors maximize assistance first; use Medicare as one tool in the broader Action Plan.

## Main files

- `index.html` — page shell and script loading.
- `styles.css` — core design system.
- `concierge-app.css` — concierge and Action Plan interface.
- `health-profile.css` — guided Health Profile interface.
- `resource-engine.js` — Illinois recommendation logic.
- `app-concierge.js` — main concierge, Action Plan, profile, and local-storage flow.
- `health-profile.js` — optional guided current-plan, doctor, drug, pharmacy, hospital, and preference intake.
- `COMPETITIVE_STRATEGY.md` — product benchmark and differentiation notes.

## Demo limitations

This is a static front-end prototype using browser `localStorage`. Health-profile information is therefore stored only on the current device in the prototype.

Do not enter Medicare numbers, Social Security numbers, bank information, or other sensitive account identifiers into the demo.

The prototype does not yet provide secure cloud accounts, authentication, cross-device recovery, live provider-network verification, live formulary checks, live plan comparison, enrollment integrations, encryption-at-rest, or production consent auditing.

Before production use, replace browser storage with a secure backend and complete privacy, security, Medicare marketing, telemarketing/SMS, and consumer-health-data compliance review.

## GitHub Pages

The site runs directly from the repository root.