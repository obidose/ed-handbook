# AGENTS.md

## Cursor Cloud specific instructions

This is a Python-based MkDocs Material static documentation site with no backend, database, or external service dependencies.

### Quick reference

| Action | Command |
|---|---|
| Install deps | `pip install -r requirements.txt` |
| Dev server | `mkdocs serve` (port 8000) |
| Build | `mkdocs build` |
| Deploy | `mkdocs gh-deploy` |

### Caveats

- `mkdocs` installs to `~/.local/bin`; if the command is not found, ensure `$HOME/.local/bin` is on `PATH`.
- The `mkdocs-git-revision-date-localized-plugin` requires the full git history to show accurate "last updated" dates. In shallow-cloned environments, it falls back to build date (configured via `fallback_to_build_date: true` in `mkdocs.yml`).
- The site has no linting, type-checking, or automated test suite. Validation is done via `mkdocs build` (which reports warnings for broken links and missing snippet paths) and manual browser review.
- Snippet files under `docs/snippets/` are included in other pages via `pymdownx.snippets` and are intentionally excluded from the `nav` configuration; build warnings about them are expected.
- Three client-side JavaScript calculators (`mg-converter.js`, `ca-converter.js`, `edacs-calculator.js`) in `docs/javascripts/` can only be tested in the browser.
