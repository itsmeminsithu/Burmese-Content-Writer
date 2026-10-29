<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Burmese Content Writer (Thailand Easy Pass Content AI)

React + Vite app that drafts Myanmar-language marketing content for "Thailand Easy Pass / Easy Visa For Myanmar", for Myanmar travellers to Thailand. Posts come from the Gemini API. You can tune them, save them as drafts, and reuse them.


## What it does

- Generates posts by service category: Visa Extension, TDAC Registration, TM30 Service, Letter Service, TR Visa Support, Airport Assistant, Knowledge Post, Document Checklist, Health Insurance, Elite VIP Service, Arrival Tips.
- Controls for format, length, tone, intent, and language, plus emoji sets you can pick from.
- Per-category style training: paste sample posts and the generator is told to copy their rhythm, emoji use, and flow.
- Copy-history feedback: recent copied posts are fed back as style preferences for later runs.
- Content calendar generation for planned posts.
- Smart Reply inbox: drafts a reply to a client message using the editable knowledge base of service facts.
- Editable knowledge base (add, search, remove entries) and saved drafts.
- State, drafts, and knowledge entries sit in the browser's localStorage. There is no backend or database in this repo.

## Stack

- React 19, TypeScript, Vite 6
- Tailwind CSS (via CDN in `index.html`)
- Google Gemini API (`@google/genai`)

## Structure

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

## Run it

You need Node.js.

1. `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local)
3. `npm run dev`

`npm run build` builds for production. `npm run preview` serves that build locally.

## Live preview (GitHub Pages — post-merge step, not yet live)

Pages serves the production build of a Vite app, not the source tree. No mock or screenshot page has been added.

- `vite.config.ts` sets `base: '/Burmese-Content-Writer/'`, which a project Pages site at `https://itsmeminsithu.github.io/Burmese-Content-Writer/` needs.
- After this PR is merged, add a Pages build workflow by hand in the GitHub web UI. Workflow files cannot be pushed through the Muse GitHub App — they return 403. The workflow is described in full in the PR description: install dependencies, run `npm run build`, deploy `dist/` with GitHub Pages. Pages source then becomes GitHub Actions.
- Pages is not live until that workflow file exists, a run succeeds, and the URL loads. This PR alone does not make it live.
- The Gemini features need a `GEMINI_API_KEY` secret at build time (the app inlines it via `vite.config.ts`). Without it the page loads, but AI generation calls fail.

## License

MIT License. See [`LICENSE`](./LICENSE).
