### webcrypto-jwt

A JSON Web Tokens (JWT) verify/sign implementation using W3C Web Cryptography (crypto.subtle).

#### Install

```js
npm i webcrypto-jwt

# or

bower i webcrypto-jwt
```

#### Usage

```js
var verifyJWT = require('webcrypto-jwt').verifyJWT;

// token signed using 'secret' as secret
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.' +
  'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

verifyJWT(token, 'secret', 'HS256', function (err, isValid) {
  console.log(isValid); // true
});

verifyJWT(token, 'nosecret', 'HS256', function (err, isValid) {
  console.log(isValid); // false
});
```

