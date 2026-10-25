<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Burmese Content Writer (Thailand Easy Pass Content AI)

A React + Vite web app that drafts Myanmar-language marketing content for
"Thailand Easy Pass / Easy Visa For Myanmar", aimed at Myanmar travellers to
Thailand. Content is generated with the Gemini API and can be tuned, saved as
a draft, and reused.

View your app in AI Studio: https://ai.studio/apps/drive/1tc5tIIAifsymZtv4XZlF5tKyXMs0bQ-B

## Features

- AI post generation by service category: Visa Extension, TDAC Registration,
  TM30 Service, Letter Service, TR Visa Support, Airport Assistant, Knowledge
  Post, Document Checklist, Health Insurance, Elite VIP Service, and Arrival
  Tips.
- Controls for content format, length, tone, intent, and language, plus
  selectable emoji sets.
- Per-category style training: paste sample posts and the generator is
  instructed to replicate their rhythm, emoji use, and persuasive flow.
- Copy-history feedback: recent copied posts are fed back as style
  preferences for later generations.
- Content calendar generation for planned posts.
- Smart Reply inbox: draft a reply to a client message using the editable
  knowledge base of service facts.
- Editable knowledge base (add, search, and remove entries) and saved drafts.
- App state, drafts, and knowledge entries persist in the browser's
  localStorage — there is no backend or database in this repo.

## Tech Stack

- React 19, TypeScript, Vite 6
- Tailwind CSS (via CDN in `index.html`)
- Google Gemini API (`@google/genai`)

## Project Structure

```txt
Burmese-Content-Writer/
├── App.tsx                  # Main UI: generation, calendar, inbox, drafts
├── index.tsx                # React entry point
├── index.html               # Page shell (title: Thailand Easy Pass Content AI)
├── constants.tsx            # Default brand/audience, categories, emoji sets
├── types.ts                 # App state and generation result types
├── services/
│   └── geminiService.ts     # generateContent, generateCalendar, generateSmartReply
├── package.json
├── vite.config.ts
├── tsconfig.json
└── metadata.json
```

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Other scripts: `npm run build` builds for production, `npm run preview`
previews the production build locally.

## Live preview (GitHub Pages — post-merge step, not yet live)

This is a Vite app, so Pages serves the production build, not the source
tree — and no mock or screenshot page has been added:

- `vite.config.ts` now sets `base: '/Burmese-Content-Writer/'`, which is
  required for a project Pages site at
  `https://itsmeminsithu.github.io/Burmese-Content-Writer/`.
- After this PR is merged, add a Pages build workflow manually via the GitHub
  web UI (workflow files cannot be pushed through the Muse GitHub App — they
  return 403). The workflow is described in full in the PR description: it
  installs dependencies, runs `npm run build`, and deploys `dist/` with
  GitHub Pages. The repository's Pages source then becomes GitHub Actions.
- Pages is NOT live until that workflow file exists, a run succeeds, and the
  URL actually loads — this PR alone does not make it live.
- Note: the Gemini features in the preview need a `GEMINI_API_KEY` secret
  available at build time (the app inlines it via `vite.config.ts`); without
  it, the page loads but AI generation calls will fail.

## License

MIT License. See [`LICENSE`](./LICENSE).
