var token = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9',
  'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
].join('.');

verifyJWT(token, 'secret', 'HS256', function (err, res) {
  assert.ifError(err);
  assert.equal(true, res);
});

verifyJWT(token, 'secret2', 'HS256', function (err, res) {
  assert.ifError(err);
  assert.equal(false, res);
});

var invalidSignatureToken =
  (token.split('.').slice(0,2).concat('invalidsignature')).join('.');

verifyJWT(invalidSignatureToken, 'secret', 'HS256', function (err, res) {
  assert.ifError(err);
  assert.equal(false, res);
});

verifyJWT(null, 'secret', 'HS256', function (err, res) {
  assert.equal('token must be a string', err.message);
  assert(!res);
});

verifyJWT({}, 'secret', 'HS256', function (err, res) {
  assert.equal('token must be a string', err.message);
  assert(!res);
});

verifyJWT(token, null, 'HS256', function (err, res) {
  assert.equal('secret must be a string', err.message);
  assert(!res);
});

verifyJWT(token, {}, 'HS256', function (err, res) {
  assert.equal('secret must be a string', err.message);
  assert(!res);
});

verifyJWT('foo', 'secret', 'HS256', function (err, res) {
  assert.equal('token must have 3 parts', err.message);
  assert(!res);
});

verifyJWT(token, 'secret', null, function (err, res) {
  assert.equal('alg must be a string', err.message);
  assert(!res);
});

verifyJWT(token, 'secret', 'POSE123', function (err, res) {
  assert.equal('algorithm not found', err.message);
  assert(!res);
});

assert.throws(function () {
  verifyJWT(token, 'secret', 'HS256', null);
});

signJWT({user: 'john.doe'}, 'secret', 'HS256', function (err, res) {
  assert.ifError(err);
  var expectedToken = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJ1c2VyIjoiam9obi5kb2UifQ',
    'gznFhZxGqtZhWcu0S6gKIgXLcF7kKiV2ZJpLy3ieH1Y'
  ];

  assert.equal(expectedToken.join('.'), res);
});

signJWT(null, 'secret', 'HS256', function (err, res) {
  assert.equal('payload must be an object', err.message);
  assert(!res);
});

signJWT({}, null, 'HS256', function (err, res) {
  assert.equal('secret must be a string', err.message);
  assert(!res);
});

signJWT({}, {}, 'HS256', function (err, res) {
  assert.equal('secret must be a string', err.message);
  assert(!res);
});

signJWT({}, 'secret', null, function (err, res) {
  assert.equal('alg must be a string', err.message);
  assert(!res);
});

signJWT({}, 'secret', {}, function (err, res) {
  assert.equal('alg must be a string', err.message);
  assert(!res);
});

signJWT({foo: 'bar'}, 'secret', 'POSE123', function (err, res) {
  assert.equal('algorithm not found', err.message);
  assert(!res);
});

assert.throws(function () {
  signJWT(token, 'secret', 'HS256', null);
});

// Roundtrip
signJWT({foo: 'bar'}, 'secret', 'HS256', function (err, token) {
  verifyJWT(token, 'secret', 'HS256', function (err, valid) {
    assert.ifError(err);
    assert(valid);
  });
});

// TODO Handle UTF8
// TODO Test smileys 😱 (ctrl + cmd + space)
