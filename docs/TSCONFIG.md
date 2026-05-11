# tsconfig — required path alias

All new files import via `@/...` — e.g. `@/components/ui`, `@/lib/data/queries`.

Your repo's `tsconfig.json` must include the path mapping. If you copied the
standard Next.js scaffold, you already have it. Otherwise, add this to
`compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

If you've changed the source root (e.g. you're not using `src/`), adjust the
mapping accordingly.

## Optional: add a CI check

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Run `npm run typecheck` after applying the overlay to surface any missing
imports or type errors immediately.
