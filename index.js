(function () {
  var exports = (typeof module !== 'undefined' && module.exports)  || window;

  var cryptoSubtle = (window.crypto && crypto.subtle) ||
    (window.crypto && crypto.webkitSubtle) ||
    (window.msCrypto && window.msCrypto.Subtle);

  if (!cryptoSubtle) {
    throw new Error('crypto.subtle not found');
  }

// Adapted from https://chromium.googlesource.com/chromium/blink/+/master/LayoutTests/crypto/subtle/hmac/sign-verify.html
  var Base64URL = {
    stringify: function (a) {
      var base64string = btoa(String.fromCharCode.apply(0, a));
      return base64string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    },
    parse: function (s) {
      s = s.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
      return new Uint8Array(Array.prototype.map.call(atob(s), function (c) { return c.charCodeAt(0); }));
    }
  };

  function asciiToUint8Array(str) {
      var chars = [];
      for (var i = 0; i < str.length; ++i) {
        chars.push(str.charCodeAt(i));
      }
      return new Uint8Array(chars);
  }

  function isString(s) {
    return typeof s === 'string';
  }

  function isFunction(fn) {
    return typeof fn === 'function';
  }

  function isObject(arg) {
    return arg !== null && typeof arg === 'object';
  }

  exports.verifyJWT = function signJWT(token, secret, alg, cb) {
    if (!isFunction(cb)) {
      throw new Error('cb must be a function');
    }

    if (!isString(token)) {
      return cb(new Error('token must be a string'));
    }

    if (!isString(secret)) {
      return cb(new Error('secret must be a string'));
    }

    if (!isString(alg)) {
      return cb(new Error('alg must be a string'));
    }

    var tokenParts = token.split('.');

    if (tokenParts.length !== 3) {
      return cb(new Error('token must have 3 parts'));
    }

    var algorithms = {
      HS256: {
        name: 'HMAC',
        hash: {
          name: 'SHA-256'
        }
      }
    };

    var importAlgorithm = algorithms[alg];

    if (!importAlgorithm) {
      return cb(new Error('algorithm not found'));
    }

    // TODO Test asciiToUint8Array function
    var keyData = asciiToUint8Array(secret);

    cryptoSubtle.importKey(
      'raw',
      keyData,
      importAlgorithm,
      false,
      ['sign']
    ).then(function (key) {
      var partialToken = tokenParts.slice(0,2).join('.');
      var signaturePart = tokenParts[2];

      // TODO Test asciiToUint8Array function
      var messageAsUint8Array = asciiToUint8Array(partialToken);
      // TODO Test asciiToUint8Array function
      var signatureAsUint8Array = asciiToUint8Array(signaturePart);
      cryptoSubtle.sign(
        importAlgorithm.name,
        key,
        messageAsUint8Array
      ).then(function (res) {
        // TODO Test
        var resBase64 = Base64URL.stringify(new Uint8Array(res));

        // TODO Time comparison
        cb(null, resBase64 === signaturePart);
      }, cb);

    }, cb);
  };

  exports.signJWT = function signJWT(payload, secret, alg, cb) {
    if (!isFunction(cb)) {
      throw new Error('cb must be a function');
    }

    if (!isObject(payload)) {
      return cb(new Error('payload must be an object'));
    }

    if (!isString(secret)) {
      return cb(new Error('secret must be a string'));
    }

    if (!isString(alg)) {
      return cb(new Error('alg must be a string'));
    }

    var algorithms = {
      HS256: {
        name: 'HMAC',
        hash: {
          name: 'SHA-256'
        }
      }
    };

    var importAlgorithm = algorithms[alg];

    if (!importAlgorithm) {
      return cb(new Error('algorithm not found'));
    }

    var payloadAsJSON;

    try {
      payloadAsJSON = JSON.stringify(payload);
    } catch (err) {
      return cb(err);
    }

    var header = {alg: alg, typ: 'JWT'};
    var headerAsJSON = JSON.stringify(header);

    var partialToken = Base64URL.stringify(asciiToUint8Array(headerAsJSON)) + '.' +
       Base64URL.stringify(asciiToUint8Array(payloadAsJSON));

    // TODO Test asciiToUint8Array function
    var keyData = asciiToUint8Array(secret);

    cryptoSubtle.importKey(
      'raw',
      keyData,
      importAlgorithm,
      false,
      ['sign']
    ).then(function (key) {
      // TODO Test asciiToUint8Array function
      var messageAsUint8Array = asciiToUint8Array(partialToken);

      cryptoSubtle.sign(
        importAlgorithm.name,
        key,
        messageAsUint8Array
      ).then(function (signature) {
        // TODO Test
        var signatureAsBase64 = Base64URL.stringify(new Uint8Array(signature));

        var token = partialToken + '.' + signatureAsBase64;

        cb(null, token);
      }, cb);
    }, cb);
  };

  exports.decodeJWT = function (token) {
    var output = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw 'Illegal base64url string!';
    }

    // TODO Use shim or document incomplete browsers
    var result = window.atob(output);

    try{
      return decodeURIComponent(escape(result));
    } catch (err) {
      return result;
    }
  };

}());
