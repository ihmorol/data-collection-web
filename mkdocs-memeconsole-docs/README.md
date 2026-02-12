# MemeConsole MkDocs Site

This is a standalone MkDocs project for complete technical documentation of the MemeConsole repository.

## Run locally

```bash
cd mkdocs-memeconsole-docs
python3 -m pip install -r requirements.txt
mkdocs serve
```

## Build static docs

```bash
cd mkdocs-memeconsole-docs
mkdocs build
```

## Notes

1. The theme is dark and aligned with the current app UI tokens.
2. Existing docs from repository root `docs/` are imported under `docs/reference/source-docs/`.
