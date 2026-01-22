# Canvas Build

Canvas overlay for the universal chat experience.

## Entry points

- `CanvasMode.tsx`: shimmed export for consumers
- `components/CanvasPage.tsx`: main modal UI for template-driven app/code generation

## Structure

- `components/CanvasPage.tsx`: Full-screen canvas UI with templates, chat input, file tree, preview/code tabs, download/copy actions
- `hooks/`: place canvas-specific hooks here
- `ui/`: place presentational subcomponents here

## How it opens

- Triggered from the Canvas button in `../ChatRightPanel.tsx` (desktop) and the mobile Canvas toggle in `../EnhancedChatLayout.tsx`.
- Exported via `../index.ts` and the root shim `../../CanvasMode.tsx` for backwards compatibility.

## Data flow

- Canvas user input posts to `/api/canvas/generate` (see `handleSendMessage` in `CanvasMode.tsx`).
- Generated HTML is written into the iframe preview; also exposed as downloadable/copyable code.

## When editing

- Keep component colocated here; update imports in `ChatRightPanel.tsx`, `EnhancedChatLayout.tsx`, and `index.ts` if new files are added.
- If adding helpers/hooks, place them in this folder and import from here to avoid scattering canvas logic elsewhere.
