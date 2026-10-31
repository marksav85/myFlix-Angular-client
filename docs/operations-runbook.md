# Operations Runbook

## Service overview

myFlix is an Angular single-page client served as static assets by Cloudflare Workers. It calls a separately maintained Movie API for authentication, movie data and account operations. The frontend does not host the API or store application data. The README contains the portfolio overview; the [Development Handbook](development-handbook.md) describes the internal architecture.

| Environment       | Frontend                                                                                           | API origin                                  | Evidence                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Local development | Angular CLI at `http://localhost:4200`                                                             | `http://localhost:8080`                     | `src/environments/environment.development.ts`                                               |
| Production        | `https://angular.myflix.marksavilledesigns.com` and `https://myflix-angular.marksav85.workers.dev` | `https://api.myflix.marksavilledesigns.com` | README-reported deployed endpoints; API origin is also in `src/environments/environment.ts` |

The production frontend and API are separate services. Cloudflare hosting and domain ownership are not configured by this repository alone. Dashboard and live state must be confirmed by an authorized operator before release work.

## Prerequisites and local setup

The repository lockfile and Angular CLI are the sources of dependency versions. The root package does not pin Node or npm. The locked Angular CLI metadata accepts Node `^16.14.0 || >=18.10.0` and npm `^6.11.0 || ^7.5.6 || >=8.0.0`; choose a supported Node/npm pair compatible with the installed Angular 16 toolchain. The versions used for a previous Cloudflare build are recorded separately under deployment and should not be treated as universal local requirements.

Install locked frontend dependencies and start the client:

```sh
npm ci
npm start
```

The `start` script runs the Angular development server on port 4200 and selects the development build configuration. That configuration replaces `src/environments/environment.ts` with `src/environments/environment.development.ts`, which points to the local API at port 8080. The separate Movie API must be running and configured to allow the Angular origin through CORS. The frontend does not provide or start that backend during ordinary `npm start` use.

The API origin is compiled into the browser bundle. To use another API, change the appropriate Angular environment configuration in a separately authorized source change, then rebuild. Do not put API credentials or server secrets in frontend environment files; values in the bundle are public.

## Build and verification

Run checks sequentially to limit resource use. Select checks appropriate to the change; a documentation-only change does not require application tests or a build.

| Command                                                  | Use                                                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run format:check`                                   | Check maintained TypeScript, Angular HTML and SCSS under `src/` and `tests/` without writing files.                |
| `npm run lint`                                           | Run Angular ESLint checks for TypeScript and templates under `src/`.                                               |
| `./node_modules/.bin/tsc --noEmit -p tsconfig.app.json`  | Type-check application TypeScript.                                                                                 |
| `./node_modules/.bin/tsc --noEmit -p tsconfig.spec.json` | Type-check maintained unit specs.                                                                                  |
| `npm test -- --watch=false --browsers=ChromeHeadless`    | Run the Karma/Jasmine unit suite once; requires a compatible Chrome/Chromium installation.                         |
| `npm run test:integration`                               | Run the isolated backend HTTP validation and consolidated Angular unit/integration suite; see prerequisites below. |
| `npm run build -- --configuration development`           | Produce a development bundle using the localhost API origin.                                                       |
| `npm run build -- --configuration production`            | Produce the production bundle using the production API origin.                                                     |

The production configuration is the default for `npm run build`. Angular writes bundles to `dist/my-flix-angular-client/`; this is ignored generated output. Do not run concurrent Angular checks or leave watch processes running during release verification.

## Isolated backend integration test

The integration runner in [`scripts/validate-integration.cjs`](../scripts/validate-integration.cjs) uses the separate Movie API checkout at `../movie-api` by default. `MYFLIX_BACKEND_PATH` selects an already prepared backend checkout. Backend dependencies must already be available there.

The runner creates a fresh MongoDB Memory Server database, starts the API on `127.0.0.1:8080`, creates a disposable account and movie fixture, performs direct HTTP checks, then runs the Angular suite including `tests/integration/client-backend.spec.ts`. It generates a random JWT secret, sets test environment values itself, does not load the backend `.env`, does not use a configured production database, and disables MongoDB runtime downloads. The API validation attempts to delete its disposable account in a `finally` block. Only after both the API phase and Angular suite succeed does the runner assert that no users remain and print its cleanup-verification message. MongoDB Memory Server and Mongoose are resolved from the backend checkout.

The runner requires an executable that reports MongoDB **8.2.6**. It first accepts `MONGOMS_SYSTEM_BINARY`, otherwise it searches the backend checkout's `node_modules/.cache/mongodb-memory-server` for version-matched `mongod-*` executables. It rejects zero or multiple compatible candidates. Runtime downloads are disabled, so prepare the binary through the approved local toolchain before running offline. If the binary is elsewhere, point the variable at its executable path:

```sh
MONGOMS_SYSTEM_BINARY=/path/to/mongod npm run test:integration
```

For a backend checkout at another location, set `MYFLIX_BACKEND_PATH` to that existing checkout. These variables are runner overrides, not Angular build-time configuration. The API listens on fixed local port 8080; inspect that port before running. If another process owns it, identify the process and resolve the conflict through its owner rather than terminating an unrelated service. An `EADDRINUSE` failure indicates a local port conflict. Binary-resolution failures report the required version and checked source; verify the executable with `mongod --version` and ensure exactly one compatible candidate is selected. API or Karma failures should be diagnosed from the runner output; do not rerun repeatedly without addressing the reported cause.

On handled completion, the outer cleanup stops the child test process when needed, closes the API listener, disconnects Mongoose and stops the temporary database. If an earlier phase fails, this resource cleanup still runs, but the final zero-user assertion and success message are skipped; account deletion is attempted only if API validation entered its `try` block. Abrupt process termination may bypass JavaScript cleanup. After a failed or interrupted run, inspect the process and runner result before another attempt. Do not connect this test to production or an existing personal database.

## Production build and deployment

### Source-controlled configuration

[`angular.json`](../angular.json) sets the production build output to `dist/my-flix-angular-client/`. [`wrangler.jsonc`](../wrangler.jsonc) names the Worker `myflix-angular`, points static assets to `./dist/my-flix-angular-client`, and enables `single-page-application` not-found handling. This fallback is required so direct browser navigation or refresh on Angular routes is served by the app shell.

The README records Cloudflare Workers Builds as the deployment workflow and reports these dashboard settings as previously verified: GitHub repository `marksav85/myFlix-Angular-client`, production branch `master`, root directory `/`, build command `npm ci && npm run build -- --configuration production`, Node.js `18.20.8`, npm `10.9.2`, and `SKIP_DEPENDENCY_INSTALL=1`. These dashboard values are not represented in tracked Cloudflare configuration and have not been independently checked for currentness in this task. Confirm them in the authorized Cloudflare dashboard before relying on them. In particular, verify dependency installation behavior and any bindings or variables required by the actual deployment method.

### Workers Builds and manual deployment

Workers Builds is the README-reported automated path: it builds and deploys from the configured GitHub branch. Verify the active branch, build command, runtime versions and asset output in the dashboard before release. No dashboard access or deployment was performed for this runbook.

The README also records this manual Wrangler command:

```sh
npm exec --yes --package=node@22 --package=wrangler@4 -- wrangler deploy --assets ./dist/my-flix-angular-client --name myflix-angular --compatibility-date 2026-10-08
```

This is not an npm script and Wrangler is not declared as a project dependency. The command uses `npm exec --yes` to obtain Node 22 and Wrangler 4 when not already available, which can require package/network access. The README reports the distinction that the Cloudflare build uses Node 18.20.8 while this manual command selects Node 22 for Wrangler. Treat the command and version combination as previously reported operational information; verify current Cloudflare/Wrangler requirements, authorization, target and configuration preservation before using it. Do not deploy solely because this command is documented. Workers Builds and manual Wrangler deployment are distinct release methods; choose one authorized method and confirm its environment settings and rollback path first.

The README reports the custom domain `angular.myflix.marksavilledesigns.com` and Workers URL `myflix-angular.marksav85.workers.dev`, and says route refreshes were verified after a prior Workers Builds deployment. These are historical operational reports, not a live health check. The repository does not define production monitoring, alerting, a release approval workflow, or an application-level rollback command.

## Post-deployment verification

After an authorized release, verify the release in Cloudflare using the selected deployment method, then exercise the application through a browser and confirm the production API integration:

1. Open the custom domain and, if available, the Workers URL. Confirm the app shell and static assets load.
2. Open and refresh `/login`, `/signup`, `/movies`, and a real `/movies/:movieId` URL. A refresh should return the Angular app shell, then render the route.
3. Sign in with an authorized test account. Confirm the movie library loads and a movie detail page shows the selected movie.
4. Add and remove a favourite, then revisit the relevant page and confirm the server-backed membership persists.
5. Verify profile retrieval and an approved profile update with a non-production test account. Verify deletion only with a disposable account when deletion testing has been explicitly approved.
6. Sign out and confirm navigation returns to Login. Check browser network errors and the authorized Cloudflare request/runtime logs, if configured and available.

Never use a real user's account for destructive verification. Do not expose JWTs, passwords, or personal data in screenshots, tickets, or logs shared outside approved systems.

## Troubleshooting

| Symptom                                                 | Checks                                                                                                                                                      | Safe response                                                                                                                                                |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local UI loads but API requests fail                    | Confirm the local API is running at `http://localhost:8080`, the selected Angular environment is development, and backend CORS permits the frontend origin. | Start or repair the separately maintained backend in its own authorized workspace; do not point the frontend at production to bypass local setup.            |
| Requests go to the wrong API                            | Inspect the selected environment file and Angular file replacement in `angular.json`; the API URL is bundled at build time.                                 | Rebuild using the intended configuration. Do not expect a Worker runtime setting to change an already-built API URL.                                         |
| Browser reports CORS errors                             | Compare the browser origin and request origin with the backend's allowed origins; inspect the backend response headers.                                     | Correct backend CORS configuration through its authorized repository/operations process. Do not disable browser security.                                    |
| Integration runner cannot find MongoDB                  | Check the exact 8.2.6 version, executable permission, cache location, and any `MONGOMS_SYSTEM_BINARY` override.                                             | Use one compatible pre-existing binary and an explicit override if needed. Downloads are disabled; do not enable implicit runtime downloads as a workaround. |
| Integration runner reports port 8080 in use             | Identify the listener and determine whether it is an unrelated service or a previous test process.                                                          | Do not kill an unknown process. Ask its owner or wait for a confirmed prior test process to exit; rerun only after the port is clear.                        |
| Angular tests fail in ChromeHeadless                    | Check that Chrome/Chromium is installed and available to Karma; separate browser launch failures from assertion failures in the output.                     | Fix the local test environment or investigate the failing test before rerunning. Do not weaken assertions to make the suite green.                           |
| Deployment build fails                                  | Verify the selected build Node/npm versions, lockfile install, configured command, output path and dashboard build logs.                                    | Keep the failure log private if it contains environment details; correct only the authorized build configuration and rerun the relevant build.               |
| Deployment succeeds but a direct route returns an error | Check that the deployed Worker uses the tracked static asset path and SPA fallback, and that the release contains `index.html`.                             | Restore the correct asset/fallback configuration through an authorized deployment. Verify direct route refresh again.                                        |
| Production app loads but API calls fail                 | Check the compiled production API origin, API availability, CORS, authentication response, and authorized provider logs.                                    | Escalate backend or hosting issues to the responsible operator; do not put backend secrets into the frontend or edit production data to diagnose it.         |

## Recovery, monitoring and security

The client serves static assets and has no persistent application database. A frontend release rollback must use a currently available, authorized Cloudflare release mechanism; its availability and procedure are not established by this repository and must be confirmed before release. Do not assume a rollback command or dashboard capability. A frontend rollback cannot restore or reverse Movie API data changes. Database backup and restoration belong to the backend's operational process.

No monitoring or alerting configuration is present in this repository. Use provider logs or metrics only when an authorized operator confirms they are configured and grants access. Record incidents and the affected release through the project's approved operational process; no escalation contact is defined here.

The production API URL is public build-time configuration. JWTs are held in browser storage and sent as Bearer tokens; never place signing secrets, database credentials, or service credentials in this client. Backend authentication and ownership checks remain authoritative. Use least-privilege Cloudflare access, protect production data, and require explicit owner authorization before deploying, deleting accounts, changing production configuration, or performing recovery.

## Operational handover and unresolved checks

Before a production release, the operator must confirm the current Workers Builds settings or the exact manual deployment target, required bindings and environment configuration, available rollback mechanism, and monitoring/log access. This runbook does not establish who owns the Cloudflare account, API hosting, or backend recovery; those roles and escalation contacts remain to be recorded by the project owner. The README's dashboard settings and production route-refresh result are useful historical reports but require current confirmation for operational decisions.
