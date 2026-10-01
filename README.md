# MyFlixAngularClient

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

### API configuration

The production build (`npm run build`) uses `src/environments/environment.ts`.
Set its `apiUrl` to the deployed backend origin before deployment. Development
builds (`npm run build -- --configuration development`) and the development server
use `src/environments/environment.development.ts`, currently `http://localhost:8080`.
Change that value if the local backend uses another port. No URL belongs in the API
service; trailing slashes are normalized there.

The finalized backend retains `/users/:Username` and
`/users/:Username/movies/:MovieID` as self-only routes. The username selects the
resource; the backend authorizes it against the Bearer JWT. There is no `/users/me`
route or user-list request. Login and successful profile responses keep the local
username selector current, including after a rename.

### Local backend integration validation

`npm run test:integration` exercises the real sibling `../movie-api` backend with
an isolated temporary MongoDB database, then runs the normal unit suite and the
opt-in Angular HTTP integration spec in one non-watch/headless Chrome session.
It never reads the backend `.env`, contacts Render, or uses an existing database.
Disposable credentials are generated in memory; accounts and the database are
removed after validation. The runner uses localhost port 8080 and must be able to
start local processes/listeners. It refuses to reuse an existing listener.

Both repositories must already have their locked dependencies installed. The
backend's cached MongoDB binary is required; runtime downloads are disabled.
`MYFLIX_BACKEND_PATH` can select another local backend checkout, and
`MYFLIX_MONGOD_BINARY` can select an existing MongoDB executable. Normal `npm test`
continues to run only the unit specs and does not require the backend.
