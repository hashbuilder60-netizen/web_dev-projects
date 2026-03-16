# Phone Privacy Audit

Local-only web app for auditing which of your own accounts use your phone number, whether they are still discoverable by number, and which settings need a review.

## Why this exists

This project is a safe alternative to phone-number account discovery. It does not search external services or try to identify other people's accounts. Instead, it helps you inventory and review the accounts you already control.

## Features

- Track platforms, handles, phone linkage, discoverability, contact syncing, and SMS-based recovery
- Flag high-priority accounts using a simple local risk score
- Generate an action queue from the settings you mark
- Save data in browser `localStorage`
- Export and import your audit as JSON
- Add a starter checklist for common social platforms

## Local run

Open [index.html](./index.html) in a browser.

## Privacy note

The app is designed to avoid storing your full phone number. Use a label like `Main line ending 42` instead.
