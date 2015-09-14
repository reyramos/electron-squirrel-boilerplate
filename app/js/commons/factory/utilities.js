(function (angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name reyramos.utilities
     *
     *
     * @description
     * A factory, to provide useful utilities within the Application
     *
     */

    angular.module('reyramos.utilities', []).factory('utilities', UtilitiesFactory);

    UtilitiesFactory.$inject = ['$location', '$rootScope', '$document'];

    /**
     * @ngdoc object
     * @name reyramos.utilities.utilities
     *
     *
     * @description
     * A factory, to provide useful utilities within the Application
     *
     */
    function UtilitiesFactory($location, $rootScope, $document) {

        var utilities = {},
            _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


        utilities.versionCompare = function (v1, v2, options) {
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


        utilities.addEvent = function (elem, type, eventHandle) {
            if (elem == null || typeof(elem) == 'undefined') return;
            if (elem.addEventListener) {
                elem.addEventListener(type, eventHandle, false);
            } else if (elem.attachEvent) {
                elem.attachEvent("on" + type, eventHandle);
            } else {
                elem["on" + type] = eventHandle;
            }
        }

        /**
         * Test the validity of an object key in reference
         * Example
         * old way of doing things
         * if(obj.key.exist)
         *
         * new way : getObjData(obj, 'key.exist'); return boolean
         *
         * @param obj
         * @param string
         * @returns {boolean}
         */
        utilities.getObjData = function (obj, string) {
            var jsonParts = string.trim().split('.'),
                result = "";


            if (jsonParts.length > 0 && obj.hasOwnProperty(jsonParts[0])) {
                result = obj[jsonParts[0]];
                jsonParts.splice(0, 1);
                if (jsonParts.length > 0)
                    result = utilities.getObjData(result, jsonParts.join('.'));
            }

            return result;

        }

        utilities.findElement = function (string) {
            return angular.element($document[0].querySelector(string))
        };

        utilities.safeApply = function (fn) {
            var phase = $rootScope.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                $rootScope.$apply(fn);
            }
        };

        utilities.getPosition = function (ele) {
            var rect = null;
            try {
                rect = ele.getBoundingClientRect();

            } catch (e) {
                rect = ele[0].getBoundingClientRect();
            }

            var rectTop = rect.top + window.pageYOffset - document.documentElement.clientTop;
            var rectLeft = rect.left + window.pageXOffset - document.documentElement.clientLeft;

            return {top: rectTop, left: rectLeft};

        }


        utilities.getDocumentHeight = function () {
            if (document.viewport && document.viewport.getHeight() > 0) {
                return document.viewport.getHeight();
            }
            if (document.all) {
                return document.body.offsetHeight;
            }
            if (document.layers) {
                return window.innerHeight;
            }
            if (document.getElementById) {
                return window.innerHeight;
            }
            return 0;
        }

        utilities.getDocumentWidth = function () {
            if (document.viewport && document.viewport.getWidth() > 0) {
                return document.viewport.getWidth();
            }
            if (document.all) {
                return document.body.offsetWidth;
            }
            if (document.layers) {
                return window.innerWidth;
            }
            if (document.getElementById) {
                return window.innerWidth;
            }
            return 0;
        }

        utilities.isIE8orlower = function () {

            var msg = "0";
            var ver = this.getInternetExplorerVersion();
            if (ver > -1) {
                if (ver >= 9.0)
                    msg = 0
                else
                    msg = 1;
            }
            return msg;
            // alert(msg);
        }


        /**
         * @ngdoc method
         * @name utilities#path
         * @methodOf reyramos.utilities.utilities
         * @kind function
         *
         * @description
         * Functionality of Angular $location.path() to add the necessary prefix
         * base on html5mode(true|false)
         *
         * @param {string} route - change angular path
         */
        utilities.path = function (route) {

            var path = (!$location['$$html5']) ? "/#" + route : (route ? route : "");
            $location.path(path)

        }

        /**
         * @ngdoc method
         * @name utilities#getBoolean
         * @methodOf reyramos.utilities.utilities
         * @kind function
         *
         * @description
         * Return configSetting from init request call
         *
         * @param {Object} value to test
         * @returns {boolean} return a true or false
         */
        utilities.getBoolean = function (value) {
            if (typeof value == 'undefined') {
                value = false;
            }

            if (typeof value != 'boolean') {
                switch (value.toString().toLowerCase()) {
                    case 'true':
                    case 'yes':
                    case 'ok':
                    case '1':
                        value = true;
                        break;

                    case 'false':
                    case 'no':
                    case 'failed':
                    case '0':
                        value = false;
                        break;

                    default:
                        value = new Boolean(value).valueOf();
                        break
                }
            }
            return value;
        }


        /**
         * @ngdoc function
         * @name utilities#arrayUnique
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * Send a mix array of values to get unique array by key
         *
         * @param {Object|Array} array todo more notes
         * @returns {Object|Array} array todo more notes
         */
        utilities.arrayUnique = function (array) {
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
        /**
         * @ngdoc function
         * @name utilities#arrayIntersection
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * Merge two array into one
         *
         * @param {ArrayObject|Array} x todo more notes
         * @param {ArrayObject|Array} y todo more notes
         * @returns {ArrayObject|Array} get one array
         */
        utilities.arrayIntersection = function (x, y) {
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
        /**
         * @ngdoc function
         * @name utilities#isEmpty
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * This function checks if an object is empty
         *
         * EXAMPLE USES:
         * isEmpty("") // True
         * isEmpty([]) // True
         * isEmpty({}) // True
         * isEmpty({length: 0, custom_property: []}) // True
         * isEmpty("Hello") // False
         * isEmpty([1,2,3]) // False
         * isEmpty({test: 1}) // False
         * isEmpty({length: 3, custom_property: [1,2,3]}) // False
         *
         * @returns {boolean} boolean
         */
        utilities.isEmpty = function (object) {

            // null and undefined are empty
            if (object === null || typeof(object) == 'undefined') {
                return true;
            }

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (Object.keys(object).length && Object.keys(object).length > 0) {
                return false;
            }
            if (Object.keys(object).length === 0) {
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
         * @ngdoc function
         * @name utilities#isValidEmail
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * Test if email send passes regular expression if its a valid email
         *
         * @returns {boolean} boolean
         */
        utilities.isValidEmail = function (email) {
            var re =
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        /**
         * This function is here to deal with an issue that
         *
         TEMPORARY FIX, angular.copy() is supposed to strip out the hashKey values, but currently is not.
         There is a pull request,
         https://github.com/angular/angular.js/pull/2423
         https://github.com/angular/angular.js/pull/2382
         *
         */
        function isWindow(obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        }


        function isScope(obj) {
            return obj && obj.$evalAsync && obj.$watch;
        }


        /**
         * @ngdoc function
         * @name utilities#utf8_encode
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * Return UTF8 of a string
         * Taken from http://phpjs.org/functions/utf8_encode/
         *
         * @param {String} argString todo more notes
         * @returns {String} argString todo more notes
         */
        utilities.utf8_encode = function (argString) {
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

        utilities.getObjData = function (obj, string) {
            var jsonParts = string.trim().split('.'),
                result = false;


            if (jsonParts.length > 0 && obj.hasOwnProperty(jsonParts[0])) {
                result = obj[jsonParts[0]];
                jsonParts.splice(0, 1);
                if (jsonParts.length > 0)
                    result = getObjData(result, jsonParts.join('.'));
            }

            return result;

        };

        /**
         * @ngdoc function
         * @name utilities#preventDefault
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * Stops event.stopPropagation() for the passing element
         *
         * @param {element} event todo more notes
         */
        utilities.preventDefault = function (event) {

            event.preventDefault();

            if (event && event.stopPropagation) {
                event.stopPropagation();
            } else {
                event = window.event;
                event.cancelBubble = true;
            }
        }
        utilities.str_replace = function (search, replace, subject, count) {
            //  discuss at: http://phpjs.org/functions/str_replace/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Gabriel Paderni
            // improved by: Philip Peterson
            // improved by: Simon Willison (http://simonwillison.net)
            // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Onno Marsman
            // improved by: Brett Zamir (http://brett-zamir.me)
            //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
            // bugfixed by: Anton Ongson
            // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // bugfixed by: Oleg Eremeev
            //    input by: Onno Marsman
            //    input by: Brett Zamir (http://brett-zamir.me)
            //    input by: Oleg Eremeev
            //        note: The count parameter must be passed as a string in order
            //        note: to find a global variable in which the result will be given
            //   example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
            //   returns 1: 'Kevin.van.Zonneveld'
            //   example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
            //   returns 2: 'hemmo, mars'
            // bugfixed by: Glen Arason (http://CanadianDomainRegistry.ca)
            //   example 3: str_replace(Array('S','F'),'x','ASDFASDF');
            //   returns 3: 'AxDxAxDx'
            // bugfixed by: Glen Arason (http://CanadianDomainRegistry.ca) Corrected count
            //   example 4: str_replace(['A','D'], ['x','y'] , 'ASDFASDF' , 'cnt');
            //   returns 4: 'xSyFxSyF' // cnt = 0 (incorrect before fix)
            //   returns 4: 'xSyFxSyF' // cnt = 4 (correct after fix)

            var i = 0,
                j = 0,
                temp = '',
                repl = '',
                sl = 0,
                fl = 0,
                f = [].concat(search),
                r = [].concat(replace),
                s = subject,
                ra = Object.prototype.toString.call(r) === '[object Array]',
                sa = Object.prototype.toString.call(s) === '[object Array]';
            s = [].concat(s);

            if (typeof(search) === 'object' && typeof(replace) === 'string') {
                temp = replace;
                replace = new Array();
                for (i = 0; i < search.length; i += 1) {
                    replace[i] = temp;
                }
                temp = '';
                r = [].concat(replace);
                ra = Object.prototype.toString.call(r) === '[object Array]';
            }

            if (count) {
                this.window[count] = 0;
            }

            for (i = 0, sl = s.length; i < sl; i++) {
                if (s[i] === '') {
                    continue;
                }
                for (j = 0, fl = f.length; j < fl; j++) {
                    temp = s[i] + '';
                    repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
                    s[i] = (temp).split(f[j]).join(repl);
                    if (count) {
                        this.window[count] += ((temp.split(f[j])).length - 1);
                    }
                }
            }
            return sa ? s : s[0];
        }


        // public method for encoding
        utilities.encode = function (input) {
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

        utilities.decode = function (input) {
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
        utilities.basename = function (path, suffix) {
            //  discuss at: http://phpjs.org/functions/basename/
            // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // improved by: Ash Searle (http://hexmen.com/blog/)
            // improved by: Lincoln Ramsay
            // improved by: djmix
            // improved by: Dmitry Gorelenkov
            //   example 1: basename('/www/site/home.htm', '.htm');
            //   returns 1: 'home'
            //   example 2: basename('ecra.php?p=1');
            //   returns 2: 'ecra.php?p=1'
            //   example 3: basename('/some/path/');
            //   returns 3: 'path'
            //   example 4: basename('/some/path_ext.ext/','.ext');
            //   returns 4: 'path_ext'

            var b = path;
            var lastChar = b.charAt(b.length - 1);

            if (lastChar === '/' || lastChar === '\\') {
                b = b.slice(0, -1);
            }

            b = b.replace(/^.*[\/\\]/g, '');

            if (typeof suffix === 'string' && b.substr(b.length - suffix.length) ==
                suffix) {
                b = b.substr(0, b.length - suffix.length);
            }

            return b;
        }
        utilities.pathinfo = function (path, options) {
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
                    have_filename = have_basename.slice(0, have_basename.length - (
                            have_extension ? have_extension.length + 1 :
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


        /**
         * @ngdoc function
         * @name utilities#md5
         * @methodOf reyramos.utilities.utilities
         *
         * @description
         * Create MD5 string
         *
         * @param {String} argString todo more notes
         * @returns {String} argString todo more notes
         *
         */
        utilities.md5 = function (str) {
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
         * @ngdoc method
         * @name utilities#utf8_encode
         * @methodOf reyramos.utilities.utilities
         * @kind function
         *
         * @description
         * Return UTF8 of a string
         * Taken from http://phpjs.org/functions/utf8_encode/
         *
         * @param {String} argString todo more notes
         * @returns {String} argString todo more notes
         */
        utilities.utf8_decode = function (str_data) {
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

        /**
         * @ngdoc method
         * @name utilities#utf8_encode
         * @methodOf reyramos.utilities.utilities
         * @kind function
         *
         * @description
         * Return UTF8 of a string
         * Taken from http://phpjs.org/functions/utf8_encode/
         *
         * @param {String} argString todo more notes
         * @returns {String} argString todo more notes
         */
        utilities.utf8_encode = function (argString) {
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


        return utilities;

    }

})(window.angular);
