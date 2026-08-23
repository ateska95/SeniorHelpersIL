# SeniorHelpersIL

Illinois-focused senior help station and member profile MVP.

## Current experience

- Five help areas: Food, Housing, Bills, Money & Benefits, and Healthcare.
- Three-step journey: choose help, enter routing details, see the Action Plan.
- Illinois ZIP is the only universal required routing field.
- Medicare and Medicaid questions appear only for Healthcare.
- Medicare and Medicaid answers are optional during routing.
- No urgency questionnaire.
- No age question before recommendations.
- Category-based Action Plan with one clear Start Here step per topic.
- Secondary recommendations stay collapsed until requested.
- Food recommendations distinguish local food access, SNAP, and senior meals.
- Housing recommendations distinguish local navigation, affordable housing, and legal help.
- Bills recommendations prioritize utility savings before broader local help.
- Money & Benefits separates Illinois senior discounts, broader benefit screening, and money management.
- Healthcare routes Medicare members through Medicare Savings Programs, Extra Help, coverage review, and independent SHIP support.
- Optional member profile. Only a name is required.
- Optional profile fields for ZIP, birthdate, phone, email, Medicare/Medicaid coverage, Extra Help/LIS, Medicare Savings Programs, current plan, doctors, hospitals, medications, pharmacy, household size, income range, and savings range.
- Action Plan recommendations can be saved to a profile.
- Saved programs can be marked Saved, Applied, Completed, or Not interested.
- Members can email or text their Action Plan using their device's email or messaging app.
- Medicare contact permission is stored separately from Action Plan sharing.

## Recommendation engine

`resource-engine.js` contains the current recommendation logic and trusted program destinations.

The engine is intentionally rule-based and transparent. It uses the selected help areas, Illinois ZIP, optional Medicare/Medicaid answers, and saved profile information when available.

## Product principle

Give useful answers before asking for optional personal information.

Show one best next step first. Let the member open more choices only when needed.

The profile exists to save progress and improve future recommendations.

## Main files

- `index.html` — page shell
- `styles.css` — core design system
- `action-plan.css` — focused Action Plan layout
- `resource-engine.js` — recommendation logic
- `app-v2.js` — application and profile flow
- `action-plan-ui.js` — simplified category mini-journeys

## Demo limitations

This is a static front-end prototype using browser `localStorage`. It does not yet provide secure cloud accounts, authentication, cross-device recovery, server-side email/SMS delivery, enrollment integrations, encryption-at-rest, or production consent auditing.

Before production use, replace browser storage with a secure backend and complete privacy, security, Medicare marketing, telemarketing/SMS, and consumer-health-data compliance review.

## GitHub Pages

The site runs directly from the repository root using the files listed above.
