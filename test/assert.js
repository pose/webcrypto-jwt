
function assert(x) {
  console.assert(x);
}

assert.ifError = function(err) {
    console.assert(!err);
};

assert.equal = function(a, b) {
  function isEqual(x, y) {
   if (x === y) {
     return true;
   } else if (typeof x === 'object' && typeof y === 'object') {
     var keys = Object.keys(x);

     if (keys.length !== Object.keys(y).length) {
       return false;
     }

     return keys.every(function (key) {
       return isEqual(x[key], y[key]);
     });
   } else {
     return false;
   }
  }
  console.assert(isEqual(a, b), '"' +  JSON.stringify(a) + '" != "' + JSON.stringify(b) + '"');
};

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('block must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(Array.prototype.slice.call(arguments)));
};
