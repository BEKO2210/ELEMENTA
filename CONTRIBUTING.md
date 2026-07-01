# Contributing to Elementa

Thanks for your interest in improving Elementa! There are two ways to contribute.

## 1. Contribute a component (no code setup needed)

1. Create a free account on the [live site](https://ui.it-handwerk-stuttgart.de).
2. Build your component in HTML/CSS (optional vanilla JS).
3. Upload it via the **Submit** form.
4. It goes through a short quality review and, once approved, is published for the community.

**Component requirements**

- Valid HTML5 and CSS3
- No external dependencies (or explicitly declared)
- At least a 50‑character, meaningful description
- Sensible tags and the correct category
- Respects `prefers-reduced-motion`
- Meets WCAG 2.2 AA contrast for text and visible focus states
- No trackers, malware or harmful scripts

See the full [Contributor Guidelines](https://ui.it-handwerk-stuttgart.de/docs/contribute) and [Community Rules](https://ui.it-handwerk-stuttgart.de/docs/guidelines).

## 2. Contribute to the platform (code)

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-change
   ```
2. Install dependencies and set up your `.env.local` (see the [README](./README.md#environment-variables)).
3. Make your change and verify it locally:
   ```bash
   npm run lint
   npm run build
   ```
4. Keep the code style consistent with the surrounding files (TypeScript, Tailwind v4, App Router conventions).
5. Open a pull request with a clear description of **what** changed and **why**.

For larger changes, please open an issue first to discuss the approach.

## Reporting bugs

Open an [issue](https://github.com/BEKO2210/ELEMENTA/issues) with steps to reproduce, expected vs. actual behavior, and your environment (browser, OS). Screenshots help a lot.

## Code of conduct

Be respectful and constructive. We reserve the right to remove content or contributions that violate our community rules.
