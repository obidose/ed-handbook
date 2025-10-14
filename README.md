# ED Clinician Handbook — MkDocs (Material) Starter

## Quick start
```bash
# 1) (Optional) create venv
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2) install
pip install mkdocs-material

# 3) run locally
mkdocs serve  # http://127.0.0.1:8000

# 4) deploy options
# GitHub Pages
mkdocs gh-deploy

# Cloudflare Pages: build command `mkdocs build` and publish `site/`
```
## Customising
- Edit **mkdocs.yml** to adjust nav and theme.
- Markdown pages are under **docs/**.
- Replace SharePoint placeholders with your internal URLs using “Copy link → People in your organisation”.

## Notes
- Keep internal/sensitive docs in SharePoint; link from this site.
- Add QR codes to posters in ED that point to key pages.
