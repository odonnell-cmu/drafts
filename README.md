# AI-generated documents

Documents collected by Ryan O'Donnell. Website: https://odonnell-cmu.github.io/drafts/

## Add or revise a document

Upload a PDF to `papers/` on the `main` branch. For revisions, keep the same filename. Add a matching `.json` file with `title`, `authors`, and `abstract` fields. The abstract appears beneath the title. Use an empty authors string when no byline is appropriate.

GitHub Actions records each distinct PDF version with its SHA-256 fingerprint and a GitHub-recorded workflow time, then updates the website. The PDF links point to specific commits in this repository. GitHub Pages hosts only the page and index; PDFs and their history stay in the repository.

The workflow timestamp records indexing, which precedes successful Pages deployment. Repository history and workflow records provide inspectable evidence, not independent timestamp certificates or proof of authorship. Administrators can rewrite or delete records.

`site/catalog.json` is maintained by the publishing workflow. Earlier PDF versions are preserved in Git history and the repository archive. Removing a PDF from `papers/` does not remove its archived versions.

## Local preview

Run `node scripts/build.mjs` then `node scripts/serve.mjs`. No dependencies are needed. Only GitHub Actions assigns public timestamp records.
