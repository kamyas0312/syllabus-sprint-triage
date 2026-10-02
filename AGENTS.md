<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use TanStack Router file routes for the four quest pages; the stack is fixed and type-safe navigation must match route filenames.
- Keep quest identity and per-subject progress in a shared localStorage state hook; the requested device-local persistence requires no backend.
- Keep subject content and weighted time allocation together in the quest library; all pages must derive from the same scroll catalog.
