# Glass Ledger

A complete personal finance tracker with an iOS Liquid Glass inspired interface. No build step, dependencies, analytics, external fonts, or backend.

## Put it on GitHub Pages

1. Create a GitHub repository and upload **the contents of this folder**, keeping `index.html`, `app.js`, `vault.js`, `theme-boot.js`, `styles.css`, and `favicon.svg` together at the repository root.
2. In the repository, go to **Settings → Pages**. Choose **Deploy from a branch**, select your main branch and **/(root)**, then save.
3. Open the HTTPS Pages address GitHub gives you. On the first visit, create a strong password of at least 12 characters.

Do not upload your backups, financial exports, or password to the repository. Only upload these source files.

## Run locally

Use Python 3 from this folder:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening index.html directly as a file will not work reliably with JavaScript modules and browser security rules.

## Features

- Password-first entry screen; creates an encrypted vault on first use.
- Add, edit, delete, search, and filter income and expenses.
- Monthly category budgets and overspending indicators.
- Month-to-date chart on the overview: cumulative spending and income by day, with a budget pace line when budgets are set. Hover, tap, or use arrow keys to read each day.
- 13 colorways in Settings. The chosen colorway name is stored unencrypted in this browser (key `glass-ledger-theme`) so the lock screen can match it; no financial data is included.
- Monthly income, expenses, net balance, spending breakdown, six-month cash flow, savings rate, and all-time totals.
- PHP by default, with USD, EUR, GBP, JPY, CAD, and AUD display options. Currency selection relabels amounts; it does not exchange currencies. Amounts are stored in hundredths of a currency unit.
- Encrypted backup export and restore, plus explicitly confirmed unencrypted CSV export.
- Password changes, manual lock, and automatic lock after ten minutes of inactivity.
- Responsive layout and keyboard-accessible controls, including a custom month picker (arrow keys, Escape).
- Short, spring-eased motion for page changes, dialogs, the month picker, charts, and notifications. Turned off automatically when the system "reduce motion" setting is on.

## What password protection means here

This is a **single-person, device-local encrypted vault**, not an online account or a server-authenticated service. The website source is public on GitHub Pages. Financial data is stored in browser localStorage as ciphertext using AES-256-GCM, a fresh random 96-bit IV per save, and a 256-bit key derived with PBKDF2-SHA256 (600,000 iterations, random 128-bit salt). The password and key are not persisted. Incorrect passwords cannot decrypt records; bypassing the visible login screen does not decrypt them either.

Financial data is available in memory while unlocked. Device compromise, malicious extensions, altered website code, and a person using an unlocked device are outside this protection. Use a trusted device, HTTPS, a strong unique password, and lock when finished. The vault cannot rate-limit offline password guesses, so password strength matters.

There is **no password recovery**. Backups need the password used when they were created. Changing your password does not change old backups; create a new backup afterward. Back up regularly before clearing browser data. Private browsing and storage restrictions may prevent saving or remove data later. This app is not a substitute for a bank's official records.

Each browser and website origin has its own vault. There is no automatic synchronization. Use encrypted backups to move between browsers or devices. Restoring a backup replaces the current vault only after successful decryption and validation. Make a backup of your existing ledger first. Moving to a different website address may require restoring a backup. Imported files are validated; user text is rendered as text rather than executable markup. CSV exports escape formula-like text.

## Hosting address and isolation

Browsers isolate storage and scripts by origin (scheme + host + port), not by path. Every project site at `username.github.io/<repo>` shares one origin, so other Pages projects on the same account can read or overwrite this vault's ciphertext, and their scripts count as `'self'` under this app's Content-Security-Policy. A compromised page there could also script an open ledger window. For the strongest isolation, serve the ledger from its own custom domain or subdomain, or keep only trusted static projects on that account. The Settings page shows a reminder when it detects a shared github.io project address.

The app refuses to run inside a frame. The lock-screen restore asks for confirmation before replacing an existing vault; it cannot stop someone with access to your device from erasing browser data, so keep encrypted backups.

## Customization

Edit the colors in `styles.css`. Expense and income category lists live in `vault.js`; retain existing category names if you have already saved records. This app has no sample transactions and begins empty.

## Verification

`node --test tests/vault.test.mjs` checks encryption round trips, incorrect passwords, tampering, randomized IVs, schema rejection, password rotation, and iteration-count bounds. The user interface has no automated browser tests; check setup, transactions, budgets, backup/restore, locking, password changes, and mobile layout manually after changes.
