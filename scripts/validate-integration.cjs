/* Runs only against a newly created temporary database; never loads backend .env. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawn } = require('node:child_process');
const backendRoot = path.resolve(process.env.MYFLIX_BACKEND_PATH || path.join(__dirname, '../../movie-api'));
const backendRequire = createRequire(path.join(backendRoot, 'package.json'));
const { MongoMemoryServer } = backendRequire('mongodb-memory-server');
const mongoose = backendRequire('mongoose');

// All configuration is disposable, independent of any personal/deployed database.
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
process.env.NODE_ENV = 'test';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:4200,http://localhost:9876,http://127.0.0.1:9876';
process.env.LOGIN_RATE_LIMIT_MAX = '100';
process.env.API_RATE_LIMIT_MAX = '1000';
process.env.MONGOMS_RUNTIME_DOWNLOAD = 'false';
const app = backendRequire('./app');
const { Movie, User } = backendRequire('./models');
const base = 'http://localhost:8080';
let database;
let server;
let child;
const results = [];

function checkUser(user) {
  assert.equal(typeof user._id, 'string');
  assert.equal(typeof user.Username, 'string');
  assert.equal(typeof user.Email, 'string');
  assert.ok(Array.isArray(user.FavoriteMovies));
  assert.ok(user.FavoriteMovies.every(id => typeof id === 'string'));
  assert.ok(user.Birthday == null || typeof user.Birthday === 'string');
  assert.equal(Object.hasOwn(user, 'Password'), false);
}

async function api(pathname, { method = 'GET', body, token, status = 200, origin } = {}) {
  const response = await fetch(base + pathname, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, status, method + ' ' + pathname);
  const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : await response.text();
  if (origin) assert.equal(response.headers.get('access-control-allow-origin'), origin);
  return data;
}

async function validateApi(movie) {
  let username = 'phase4' + crypto.randomBytes(8).toString('hex');
  const password = crypto.randomBytes(24).toString('hex');
  let token;
  try {
    const registered = await api('/users', { method: 'POST', status: 201, body: { Username: username, Password: password, Email: username + '@example.test', Birthday: '1990-01-02' } });
    checkUser(registered);
    assert.equal(registered.Birthday.slice(0, 10), '1990-01-02');
    results.push('registration');
    await api('/login', { method: 'POST', status: 400, body: { Username: username, Password: 'incorrect' } });
    const login = await api('/login', { method: 'POST', body: { Username: username, Password: password } });
    checkUser(login.user);
    assert.equal(typeof login.token, 'string');
    token = login.token;
    results.push('login');
    const movies = await api('/movies', { token, origin: 'http://localhost:4200' });
    assert.ok(Array.isArray(movies));
    assert.equal(movies[0]._id, movie.id);
    for (const key of ['Title', 'Description', 'ImagePath']) assert.equal(typeof movies[0][key], 'string');
    for (const [parent, keys] of [['Director', ['Name', 'Bio']], ['Genre', ['Name', 'Description']]]) {
      for (const key of keys) assert.equal(typeof movies[0][parent][key], 'string');
    }
    assert.equal((await api('/movies/' + encodeURIComponent(movie.Title), { token }))._id, movie.id);
    assert.equal((await api('/movies/director/' + encodeURIComponent(movie.Director.Name), { token }))[0]._id, movie.id);
    assert.equal((await api('/movies/genre/' + encodeURIComponent(movie.Genre.Name), { token }))[0]._id, movie.id);
    results.push('movies and encoded detail searches');
    checkUser(await api('/users/' + username, { token }));
    results.push('current-user retrieval');
    for (let repeat = 0; repeat < 2; repeat++) {
      const added = await api('/users/' + username + '/movies/' + movie.id, { method: 'POST', body: {}, token });
      checkUser(added);
      assert.deepEqual(added.FavoriteMovies, [movie.id]);
    }
    assert.deepEqual((await api('/users/' + username, { token })).FavoriteMovies, [movie.id]);
    results.push('favourite addition and idempotence');
    for (let repeat = 0; repeat < 2; repeat++) {
      const removed = await api('/users/' + username + '/movies/' + movie.id, { method: 'DELETE', token });
      checkUser(removed);
      assert.deepEqual(removed.FavoriteMovies, []);
    }
    results.push('favourite removal and repeat removal');
    const renamed = username + 'updated';
    const updated = await api('/users/' + username, { method: 'PUT', status: 201, token, body: { Username: renamed, Password: password, Email: renamed + '@example.test', Birthday: '1991-02-03' } });
    username = renamed;
    checkUser(updated);
    assert.equal(updated.Username, renamed);
    assert.equal(updated.Birthday.slice(0, 10), '1991-02-03');
    assert.equal((await api('/users/' + username, { token })).Username, renamed);
    assert.equal((await api('/login', { method: 'POST', body: { Username: username, Password: password } })).user.Username, renamed);
    results.push('profile update, rename and reuse of existing JWT');
    await api('/movies', { status: 401 });
    await api('/movies', { token: 'invalid-token', status: 401 });
    await api('/users', { token, status: 404 });
    results.push('missing/invalid auth and retired user-list route');
    const deleted = await api('/users/' + username, { method: 'DELETE', token });
    assert.equal(typeof deleted, 'string');
    assert.equal(deleted, username + ' was deleted.');
    assert.equal(await User.findOne({ Username: username }), null);
    await api('/movies', { token, status: 401 });
    results.push('plain-text deletion and rejection of deleted-account JWT');
  } finally {
    // This model belongs exclusively to our disposable database.
    await User.deleteMany({ Username: username });
  }
  console.log('Direct HTTP integration PASS: ' + results.join('; '));
}

async function cleanup() {
  if (child && child.exitCode === null) child.kill('SIGTERM');
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  if (database) await database.stop();
}

async function main() {
  database = await MongoMemoryServer.create({ binary: {
    systemBinary: process.env.MYFLIX_MONGOD_BINARY || path.join(backendRoot, 'node_modules/.cache/mongodb-memory-server/mongod-x64-ubuntu-8.2.6'),
  } });
  await mongoose.connect(database.getUri());
  const movie = await Movie.create({ Title: 'Phase 4 / & Movie', Description: 'Disposable integration fixture', Genre: { Name: 'Drama / & Test', Description: 'Test genre' }, Director: { Name: 'Director / & Test', Bio: 'Test biography' }, ImagePath: '/fixture.jpg', Featured: true });
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(8080, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  await validateApi(movie);
  child = spawn(process.execPath, [path.join(__dirname, '../node_modules/@angular/cli/bin/ng.js'), 'test', '--watch=false', '--browsers=ChromeHeadless', '--ts-config=tsconfig.integration.json', '--include=src/**/*.spec.ts', '--include=../tests/integration/**/*.spec.ts'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NG_BUILD_MAX_WORKERS: '1' },
    stdio: 'inherit',
  });
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (status, signal) => resolve(signal ? 1 : status));
  });
  assert.equal(code, 0, 'Consolidated Angular unit/integration suite');
  assert.equal(await User.countDocuments(), 0, 'Disposable accounts must be deleted');
  console.log('Cleanup verified: no disposable accounts remain.');
}

main().catch(error => {
  console.error('Integration validation failed: ' + error.message);
  process.exitCode = 1;
}).finally(cleanup);
