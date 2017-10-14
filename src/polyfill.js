/**
* polyfill for browsers other than firefox
*/
if (!('asinh' in Math)) {
  Math.asinh = function(x) {
    return Math.log(x + Math.sqrt(x * x + 1));
  };
}

/**
 * polyfill for browsers other than firefox and chrome
 */
if (!('trunc' in Math)) {
  Math.trunc = function(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  };
}

if (!('log10' in Math)) {
  Math.log10 = function(x) {
    return Math.log(x) * Math.LOG10E;
  };
}
