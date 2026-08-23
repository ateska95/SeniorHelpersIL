# SeniorHelpersIL

Illinois-focused senior help station and member profile MVP.

## Current experience

- Five help areas: Food, Housing, Bills, Money & Benefits, and Healthcare.
- Illinois ZIP, age, Medicare, and Medicaid intake.
- Urgency ranking for every selected help area.
- Color-coded Action Plan with category filters.
- Illinois resource recommendations for food, housing, bills, benefits, and healthcare.
- Optional member profile. Only a name is required.
- Optional profile fields for ZIP, birthdate, phone, email, Medicare/Medicaid coverage, Extra Help/LIS, Medicare Savings Programs, current plan, doctors, hospitals, medications, pharmacy, household size, income range, and savings range.
- Action Plan recommendations can be saved to a profile.
- Saved programs can be marked Saved, Applied, Completed, or Not interested.
- Members can email or text their Action Plan using their device's email or messaging app.
- Medicare contact permission is stored separately from Action Plan sharing.

## Demo limitations

This is a static front-end prototype using browser `localStorage`. It does not yet provide secure cloud accounts, authentication, cross-device recovery, server-side email/SMS delivery, enrollment integrations, encryption-at-rest, or production consent auditing.

Before production use, replace browser storage with a secure backend and complete privacy, security, Medicare marketing, telemarketing/SMS, and consumer-health-data compliance review.

## GitHub Pages

The site is designed to run directly from the repository root using `index.html`, `styles.css`, and `app.js`.
