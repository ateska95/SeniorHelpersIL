# SeniorHelpersIL

Illinois-focused senior assistance and Medicare guidance prototype.

## Product idea

SeniorHelpersIL helps older adults solve everyday assistance and Medicare problems in one place.

The working principle is:

**Start with the problem the person is trying to solve. Do not assume an insurance plan change is the answer.**

The consumer experience is concierge-first, plain-language, and optional-data-first.

## Current experience

### Senior assistance concierge

Consumers can ask for help with:

- Food
- Housing
- Bills
- Money & Benefits
- Healthcare

The basic Action Plan requires only selected help areas and an Illinois ZIP. Medicare and Medicaid questions appear only when Healthcare is selected.

No account is required to see an Action Plan.

### Company story

The home experience now explains that SeniorHelpersIL is designed to:

1. Find everyday Illinois assistance.
2. Find Medicare-related savings and support programs.
3. Help consumers prepare for Medicare plan decisions using their own preferences.

Trust principles shown to consumers include:

- Basic help before profile creation.
- Keeping the current Medicare plan can be the right outcome.
- Official Medicare and Illinois resources are prioritized.

### Medicare Help Center

The dedicated Medicare Help Center organizes official resources by the problem a consumer is trying to solve.

Current topics include:

- Medicare Savings Programs
- Extra Help with Part D drug costs
- Medicare + Medicaid / Illinois ABE
- Illinois SHIP counseling
- Medicare Prescription Payment Plan
- Pharmaceutical Assistance Programs
- Part A and Part B enrollment
- Claims, appeals, and complaints
- Illinois Senior Medicare Patrol
- Medicare Plan Compare

The Help Center also explains useful program relationships, including that qualifying for Medicaid or a Medicare Savings Program generally results in automatic eligibility for Extra Help.

### Health Profile

Members can optionally choose **Set up my health profile**.

The guided setup includes:

1. Current Medicare coverage and plan name
2. Doctors
3. Prescriptions
4. Pharmacies
5. Hospitals / health systems
6. Medicare coverage priorities
7. Review

Every section can be skipped. Consumers may add none, one, or many doctors, prescriptions, pharmacies, or hospitals.

The Health Profile is intended to become the input for future plan comparison. It is not a medical record.

## Recommendation engine

`resource-engine.js` contains the rule-based Illinois assistance recommendations.

Current recommendations use selected needs, Illinois ZIP, Medicare/Medicaid answers, and saved profile data when available.

## Main files

- `index.html` — page shell
- `styles.css` — base visual system
- `concierge-app.css` — concierge and Action Plan styling
- `health-profile.css` — Health Profile setup styling
- `company-medicare.css` — company story and Medicare Help Center styling
- `resource-engine.js` — Illinois assistance recommendation logic
- `app-concierge.js` — main concierge, profile, and Action Plan application
- `health-profile.js` — optional Medicare comparison-preference profile
- `company-medicare.js` — company story, Medicare Help Center, and Medicare navigation

## Product direction

SeniorHelpersIL should ultimately connect three layers:

1. **Assistance navigation** — food, housing, bills, benefits, and healthcare help.
2. **Medicare savings and education** — MSP, Extra Help, Medicaid, prescription help, enrollment, appeals, and counseling.
3. **Plan comparison and enrollment** — current plan baseline plus doctors, prescriptions, pharmacies, hospitals, costs, and member priorities.

A plan should only be recommended when it improves the member's situation. Keeping existing coverage is a valid recommendation.

## Demo limitations

This is a static prototype using browser `localStorage`.

It does not yet provide secure cloud accounts, authentication, cross-device recovery, live plan data, network verification, formulary verification, enrollment integrations, encryption-at-rest, or production consent auditing.

Do not enter Medicare numbers, Social Security numbers, banking details, or other account identifiers into the prototype.

Before production use, replace browser storage with a secure backend and complete privacy, security, Medicare marketing, telemarketing/SMS, licensing, and consumer-health-data compliance review.

## GitHub Pages

The site runs directly from the repository root.