/**
 * Created by redroger on 4/15/14.
 */

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


var extend = require('node.extend'),
    path = require('path'),
    fs = require('fs'),
    child = require('child_process'),
    service = {},
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


/**
 * Compare the version
 * @param v1
 * @param v2
 * @param options
 * @returns {*}
 */
service.versionCompare = function (v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

service.getVersion = function (url, callback) {

    require(service.parse_url(url).scheme).get(url, function (res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            try {
                var obj = JSON.parse(output);
                callback(res.statusCode, obj);
            } catch (e) {
            }

        });

    }).on('error', function (e) {
        console.error('ERROR => ', e)
        //callback(e);
    });


}

service.file_put_content = function (obj) {

    fs.writeFile(filename, text, function (err) {
        if (err) return console.log(err);
        console.log('CREATED => ', filename)
    });

}

service.mkdir = function (dir) {
    if (!fs.existsSync(dir)) {
        console.log('CREATED => ', dir)
        fs.mkdirSync(dir);
        return true;
    }

    return false;
}


service.rmdir = function (directories, callback) {
    if (typeof directories === 'string') {
        directories = [directories];
    }
    var args = directories;
    args.unshift('-rf');
    child.execFile('rm', args, {env: process.env}, callback);
};


function isFunction(obj) {
    return typeObj(obj) === "function";
}

var class2type = {};
var hasOwn = class2type.hasOwnProperty;

function typeObj(obj) {
    if (obj == null) {
        return obj + "";
    }
    // Support: Android<4.0, iOS<6 (functionish RegExp)
    return typeof obj === "object" || typeof obj === "function" ?
    class2type[toString.call(obj)] || "object" :
        typeof obj;
}

function isPlainObject(obj) {
    // Not plain objects:
    // - Any object or value whose internal [[Class]] property is not "[object Object]"
    // - DOM nodes
    // - window
    if (typeObj(obj) !== "object" || obj.nodeType) {
        return false;
    }

    if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
    }

    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true;
}


service.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;

        // Skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !isFunction(target)) {
        target = {};
    }

    // Extend jQuery itself if only one argument is passed
    if (i === length) {
        target = this;
        i--;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) )) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];

                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = service.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

service.parse_url = function (str, component) {
    //       discuss at: http://phpjs.org/functions/parse_url/
    //      original by: Steven Levithan (http://blog.stevenlevithan.com)
    // reimplemented by: Brett Zamir (http://brett-zamir.me)
    //         input by: Lorenzo Pisani
    //         input by: Tony
    //      improved by: Brett Zamir (http://brett-zamir.me)
    //             note: original by http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
    //             note: blog post at http://blog.stevenlevithan.com/archives/parseuri
    //             note: demo at http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
    //             note: Does not replace invalid characters with '_' as in PHP, nor does it return false with
    //             note: a seriously malformed URL.
    //             note: Besides function name, is essentially the same as parseUri as well as our allowing
    //             note: an extra slash after the scheme/protocol (to allow file:/// as in PHP)
    //        example 1: parse_url('http://username:password@hostname/path?arg=value#anchor');
    //        returns 1: {scheme: 'http', host: 'hostname', user: 'username', pass: 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}
    //        example 2: parse_url('http://en.wikipedia.org/wiki/%22@%22_%28album%29');
    //        returns 2: {scheme: 'http', host: 'en.wikipedia.org', path: '/wiki/%22@%22_%28album%29'}
    //        example 3: parse_url('https://host.domain.tld/a@b.c/folder')
    //        returns 3: {scheme: 'https', host: 'host.domain.tld', path: '/a@b.c/folder'}
    //        example 4: parse_url('https://gooduser:secretpassword@www.example.com/a@b.c/folder?foo=bar');
    //        returns 4: { scheme: 'https', host: 'www.example.com', path: '/a@b.c/folder', query: 'foo=bar', user: 'gooduser', pass: 'secretpassword' }

    try {
        this.php_js = this.php_js || {};
    } catch (e) {
        this.php_js = {};
    }

    var query;
    var ini = (this.php_js && this.php_js.ini) || {};
    var mode = (ini['phpjs.parse_url.mode'] && ini['phpjs.parse_url.mode'].local_value) || 'php';
    var key = [
        'source',
        'scheme',
        'authority',
        'userInfo',
        'user',
        'pass',
        'host',
        'port',
        'relative',
        'path',
        'directory',
        'file',
        'query',
        'fragment'
    ];
    var parser = {
        php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
    };

    var m = parser[mode].exec(str);
    var uri = {};
    var i = 14;

    while (i--) {
        if (m[i]) {
            uri[key[i]] = m[i];
        }
    }

    if (component) {
        return uri[component.replace('PHP_URL_', '')
            .toLowerCase()];
    }

    if (mode !== 'php') {
        var name = (ini['phpjs.parse_url.queryKey'] &&
            ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
        parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
        uri[name] = {};
        query = uri[key[12]] || '';
        query.replace(parser, function ($0, $1, $2) {
            if ($1) {
                uri[name][$1] = $2;
            }
        });
    }

    delete uri.source;
    return uri;
}

service.pathinfo = function (path, options) {
    //  discuss at: http://phpjs.org/functions/pathinfo/
    // original by: Nate
    //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Brett Zamir (http://brett-zamir.me)
    // improved by: Dmitry Gorelenkov
    //    input by: Timo
    //        note: Inspired by actual PHP source: php5-5.2.6/ext/standard/string.c line #1559
    //        note: The way the bitwise arguments are handled allows for greater flexibility
    //        note: & compatability. We might even standardize this code and use a similar approach for
    //        note: other bitwise PHP functions
    //        note: php.js tries very hard to stay away from a core.js file with global dependencies, because we like
    //        note: that you can just take a couple of functions and be on your way.
    //        note: But by way we implemented this function, if you want you can still declare the PATHINFO_*
    //        note: yourself, and then you can use: pathinfo('/www/index.html', PATHINFO_BASENAME | PATHINFO_EXTENSION);
    //        note: which makes it fully compliant with PHP syntax.
    //  depends on: basename
    //   example 1: pathinfo('/www/htdocs/index.html', 1);
    //   returns 1: '/www/htdocs'
    //   example 2: pathinfo('/www/htdocs/index.html', 'PATHINFO_BASENAME');
    //   returns 2: 'index.html'
    //   example 3: pathinfo('/www/htdocs/index.html', 'PATHINFO_EXTENSION');
    //   returns 3: 'html'
    //   example 4: pathinfo('/www/htdocs/index.html', 'PATHINFO_FILENAME');
    //   returns 4: 'index'
    //   example 5: pathinfo('/www/htdocs/index.html', 2 | 4);
    //   returns 5: {basename: 'index.html', extension: 'html'}
    //   example 6: pathinfo('/www/htdocs/index.html', 'PATHINFO_ALL');
    //   returns 6: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
    //   example 7: pathinfo('/www/htdocs/index.html');
    //   returns 7: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}

    var opt = '',
        real_opt = '',
        optName = '',
        optTemp = 0,
        tmp_arr = {},
        cnt = 0,
        i = 0;
    var have_basename = false,
        have_extension = false,
        have_filename = false;

    // Input defaulting & sanitation
    if (!path) {
        return false;
    }
    if (!options) {
        options = 'PATHINFO_ALL';
    }

    // Initialize binary arguments. Both the string & integer (constant) input is
    // allowed
    var OPTS = {
        'PATHINFO_DIRNAME': 1,
        'PATHINFO_BASENAME': 2,
        'PATHINFO_EXTENSION': 4,
        'PATHINFO_FILENAME': 8,
        'PATHINFO_ALL': 0
    };
    // PATHINFO_ALL sums up all previously defined PATHINFOs (could just pre-calculate)
    for (optName in OPTS) {
        if (OPTS.hasOwnProperty(optName)) {
            OPTS.PATHINFO_ALL = OPTS.PATHINFO_ALL | OPTS[optName];
        }
    }
    if (typeof options !== 'number') {
        // Allow for a single string or an array of string flags
        options = [].concat(options);
        for (i = 0; i < options.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[options[i]]) {
                optTemp = optTemp | OPTS[options[i]];
            }
        }
        options = optTemp;
    }

    // Internal Functions
    var __getExt = function (path) {
        var str = path + '';
        var dotP = str.lastIndexOf('.') + 1;
        return !dotP ? false : dotP !== str.length ? str.substr(dotP) : '';
    };

    // Gather path infos
    if (options & OPTS.PATHINFO_DIRNAME) {
        var dirName = path.replace(/\\/g, '/')
            .replace(/\/[^\/]*\/?$/, ''); // dirname
        tmp_arr.dirname = dirName === path ? '.' : dirName;
    }

    if (options & OPTS.PATHINFO_BASENAME) {
        if (false === have_basename) {
            have_basename = this.basename(path);
        }
        tmp_arr.basename = have_basename;
    }

    if (options & OPTS.PATHINFO_EXTENSION) {
        if (false === have_basename) {
            have_basename = this.basename(path);
        }
        if (false === have_extension) {
            have_extension = __getExt(have_basename);
        }
        if (false !== have_extension) {
            tmp_arr.extension = have_extension;
        }
    }

    if (options & OPTS.PATHINFO_FILENAME) {
        if (false === have_basename) {
            have_basename = this.basename(path);
        }
        if (false === have_extension) {
            have_extension = __getExt(have_basename);
        }
        if (false === have_filename) {
            have_filename = have_basename.slice(0, have_basename.length - (have_extension ? have_extension.length + 1 :
                    have_extension === false ? 0 : 1));
        }

        tmp_arr.filename = have_filename;
    }

    // If array contains only 1 element: return string
    cnt = 0;
    for (opt in tmp_arr) {
        if (tmp_arr.hasOwnProperty(opt)) {
            cnt++;
            real_opt = opt;
        }
    }
    if (cnt === 1) {
        return tmp_arr[real_opt];
    }

    // Return full-blown array
    return tmp_arr;
}

service.jsonParse = function (obj) {
    if (typeof (obj) !== "object") {
        try {
            return JSON.parse(obj)
        } catch (e) {
            console.error('ERROR: Cannot parse a non JSON string')
        }
    }
    return obj
}


service.objectKeyExists = function (value, obj) {

    if (obj === null || typeof (obj) == 'undefined') {
        return false;
    }
    var results = false;
    Object.keys(obj).forEach(function (key) {

        if (key.toLowerCase() === value.trim().toLowerCase()) {
            results = true;
        }

    });

    return results;
}

service.arrayUnique = function (array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }
    return a;
}

service.arrayIntersection = function (x, y) {
    var ret = [];
    for (var i = 0; i < x.length; i++) {
        for (var z = 0; z < y.length; z++) {
            if (x[i] == y[z]) {
                ret.push(i);
                break;
            }
        }
    }
    return ret;
}

service.contains = function (value, array) {
    var i = array.length;
    while (i--) {
        if (array[i].trim().toLowerCase() === value.trim().toLowerCase()) {
            return true;
        }
    }
    return false;
    ;
}

service.isEmpty = function (object) {
    // null and undefined are empty
    if (object == null) {
        return true;
    }
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (object.length && object.length > 0) {
        return false;
    }
    if (object.length === 0) {
        return true;
    }
    for (var key in object) {
        if (hasOwnProperty.call(object, key)) {
            return false;
        }
    }
    // Doesn't handle toString and toValue enumeration bugs in IE < 9
    return true;
}


/**
 * Testing if necessary params exist within the object send
 * @param  {object} obj          Object to test array if keys exist
 * @param  {array|string} array_params  array of keys to test again Object
 * @return {boolean}             True, if it contains all values
 */
service.inArray = function (obj, array_params) {
    var status = true,
        compare = Array.isArray(array_params) ? array_params : [array_params];

    for (var i in compare) {
        if (!obj.hasOwnProperty(compare[i])) {
            status = false;
            break;
        }
    }

    return status;
}


/**
 * Merge defaults with user options
 * @private
 * @param {Object} defaults Default settings
 * @param {Object} options User options
 * @returns {Object} Merged values of defaults and options
 */
service.extend = function (boolean, object) {
    var results = {};

    for (var i = 2 in arguments) {
        results = extend(boolean, object, arguments[i])
    }

    return results;
}


/**
 * @ngdoc function
 * @name ngDancik.utilities.utilities#md5
 * @methodOf ngDancik.utilities.utilities
 *
 * @description
 * Create MD5 string
 *
 * @param {String} argString
 * @returns {String} argString
 *
 */
service.md5 = function (str) {
    var xl;

    var rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    var addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var _F = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function (x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function (x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function (x, y, z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function (str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (
            lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(
                lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 <<
            lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function (lValue) {
        var wordToHexValue = "",
            wordToHexValue_temp = "",
            lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(
                    wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var x = [],
        k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
}


/**
 * @ngdoc function
 * @name ngDancik.utilities.utilities#utf8_encode
 * @methodOf ngDancik.utilities.utilities
 *
 * @description
 * Return UTF8 of a string
 * Taken from http://phpjs.org/functions/utf8_encode/
 *
 * @param {String} argString
 * @returns {String} argString
 */
service.utf8_encode = function (argString) {
    if (argString === null || typeof argString === "undefined") {
        return "";
    }

    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = '',
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(
                (c1 >> 6) | 192, (c1 & 63) | 128
            );
        } else if (c1 & 0xF800 != 0xD800) {
            enc = String.fromCharCode(
                (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
            );
        } else { // surrogate pairs
            if (c1 & 0xFC00 != 0xD800) {
                throw new RangeError("Unmatched trail surrogate at " + n);
            }
            var c2 = string.charCodeAt(++n);
            if (c2 & 0xFC00 != 0xDC00) {
                throw new RangeError("Unmatched lead surrogate at " + (n - 1));
            }
            c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
            enc = String.fromCharCode(
                (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (
                c1 & 63) | 128
            );
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
}


/**
 * @ngdoc method
 * @name utf8_encode
 * @methodOf app.utilities.utf8_decode
 * @kind function
 *
 * @description
 * Return UTF8 of a string
 * Taken from http://phpjs.org/functions/utf8_encode/
 *
 * @param {String} argString
 * @returns {String} argString
 */
service.utf8_decode = function (str_data) {
    //  discuss at: http://phpjs.org/functions/utf8_decode/
    // original by: Webtoolkit.info (http://www.webtoolkit.info/)
    //    input by: Aman Gupta
    //    input by: Brett Zamir (http://brett-zamir.me)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Norman "zEh" Fuchs
    // bugfixed by: hitwork
    // bugfixed by: Onno Marsman
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: kirilloid
    // bugfixed by: w35l3y (http://www.wesley.eti.br)
    //   example 1: utf8_decode('Kevin van Zonneveld');
    //   returns 1: 'Kevin van Zonneveld'

    var tmp_arr = [],
        i = 0,
        c1 = 0,
        seqlen = 0;

    str_data += '';

    while (i < str_data.length) {
        c1 = str_data.charCodeAt(i) & 0xFF;
        seqlen = 0;

        // http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
        if (c1 <= 0xBF) {
            c1 = (c1 & 0x7F);
            seqlen = 1;
        } else if (c1 <= 0xDF) {
            c1 = (c1 & 0x1F);
            seqlen = 2;
        } else if (c1 <= 0xEF) {
            c1 = (c1 & 0x0F);
            seqlen = 3;
        } else {
            c1 = (c1 & 0x07);
            seqlen = 4;
        }

        for (var ai = 1; ai < seqlen; ++ai) {
            c1 = ((c1 << 0x06) | (str_data.charCodeAt(ai + i) & 0x3F));
        }

        if (seqlen == 4) {
            c1 -= 0x10000;
            tmp_arr.push(String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF)), String
                .fromCharCode(0xDC00 | (c1 & 0x3FF)));
        } else {
            tmp_arr.push(String.fromCharCode(c1));
        }

        i += seqlen;
    }

    return tmp_arr.join("");
}

// public method for encoding
service.encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = this.utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

    }

    return output;
}

service.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = this.utf8_decode(output);

    return output;

}

module.exports = service;