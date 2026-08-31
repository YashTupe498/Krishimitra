# KrishiMitra

## Local startup

Apply Supabase migrations in numeric order, including `supabase/migrations/010_backend_feature_state.sql`, then start the API from the repository root:

```powershell
npm run dev:backend
```

Start the frontend in a second terminal:

```powershell
npm install
npm run dev
```

The frontend uses `VITE_API_BASE_URL` (defaults to `/api/v1`) and Vite proxies it to the FastAPI service. All protected feature requests obtain the current Supabase access token and send it as a Bearer token. Copy `.env.example` and `backend/.env.example` before configuring local values.

## Legacy template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
