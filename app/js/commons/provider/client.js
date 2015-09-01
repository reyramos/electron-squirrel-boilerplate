(function(angular) {
    "use strict";
    /**
     * @ngdoc overview
     * @name reyramos.client
     *
     * @description
     * # clientInfo sub-module
     *
     * Provides various details that describe the browser being used to render the
     * application as well as global variables specific to this instance needed to
     * properly render the correct templates/data
     *
     */
    angular.module('reyramos.client', []).provider('clientService', ClientServices);


    /**
     * @ngdoc object
     * @name reyramos.client.clientInfo
     *
     * @description
     * # clientInfo sub-module
     *
     * Provides various details that describe the browser being used to render the
     * application as well as global variables specific to this instance needed to
     * properly render the correct templates/data
     *
     */

    function ClientServices() {

        var ua = window.navigator ? window.navigator.userAgent : window.request ? window.request.headers['user-agent'] : 'No User Agent';
        var parser = new UAParser();
        this.info = {
            userAgent: ua,
            deviceType: // tv, tablet, desktop, mobile
                ua.match(/GoogleTV|SmartTV|Internet.TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|CE\-HTML/i) ? 'tv' : ua.match(/Xbox|PLAYSTATION.3|Wii/i) ? 'tv' : ua.match(/iPad/i) || ua.match(/tablet/i) && !ua.match(/RX-34/i) || ua.match(/FOLIO/i) ? 'tablet' : ua.match(/Linux/i) && ua.match(/Android/i) && !ua.match(/Fennec|mobi|HTC.Magic|HTCX06HT|Nexus.One|SC-02B|fone.945/i) ? 'tablet' : ua.match(/Kindle/i) || ua.match(/Mac.OS/i) && ua.match(/Silk/i) ? 'tablet' : ua.match(/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC(.Flyer|\_Flyer)|Sprint.ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos.S7|Dell.Streak.7|Advent.Vega|A101IT|A70BHT|MID7015|Next2|nook/i) || ua.match(/MB511/i) && ua.match(/RUTEM/i) ? 'tablet' : ua.match(/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google.Wireless.Transcoder/i) ? 'mobile' : ua.match(/Opera/i) && ua.match(/Windows.NT.5/i) && ua.match(/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i) ? 'mobile' : ua.match(/Windows.(NT|XP|ME|9)/) && !ua.match(/Phone/i) || ua.match(/Win(9|.9|NT)/i) ? 'desktop' : ua.match(/Macintosh|PowerPC/i) && !ua.match(/Silk/i) ? 'desktop' : ua.match(/Linux/i) && ua.match(/X11/i) ? 'desktop' : ua.match(/Solaris|SunOS|BSD/i) ? 'desktop' : ua.match(/Bot|Crawler|Spider|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|TinEye/i) && !ua.match(/Mobile/i) ? 'desktop' : 'mobile',
            browserName: parser.getBrowser().name,
            browserVersion: parser.getBrowser().version,
            osName: parser.getOS().name,
            osVersion: parser.getOS().version,
            engineName: parser.getEngine().name,
            engineVersion: parser.getEngine().version,
            deviceName: parser.getDevice().name,
            deviceVersion: parser.getDevice().version,
            uri: window.location.hostname,
            user: null,
            /**
             * @ngdoc function
             * @name clientInfo#viewport_size
             * @methodOf reyramos.client.clientInfo
             *
             *
             * @description
             * Gathers and returns window device innerHeight, innerWidth
             *
             * @returns {object} height, width of window
             *
             */
            viewport_size: function() {
                return {
                    height: window.innerHeight,
                    width: window.innerWidth
                }
            }(),

            /**
             * @ngdoc function
             * @name clientInfo#document_size
             * @methodOf reyramos.client.clientInfo
             *
             *
             * @description
             * Gathers and returns document_size offsetHeight, offsetWidth
             *
             * @returns {object} height, width of document
             *
             */
            document_size: function() {
                var height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight)
                var width = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth)
                return {
                    height: height,
                    width: width
                }
            }(),
            /**
             * @ngdoc function
             * @name clientInfo#orientation
             * @methodOf reyramos.client.clientInfo
             *
             *
             * @description
             * Gathers and returns orientation
             *
             * @returns {string} orientation position
             *
             */
            orientation: function() {
                return window.innerHeight > window.innerWidth ? 'portrait' : (window.orientation || 1) == 0 ? 'portrait' : 'landscape'
            }()
        }



        //List of classes to add to body
        var deviceInformationClassList = "browser-" + String(this.info.browserName).toLowerCase();
        deviceInformationClassList += " orientation-" + String(this.info.orientation).toLowerCase();
        deviceInformationClassList += " os-name-" + String(this.info.osName).toLowerCase();
        deviceInformationClassList += " device-" + String(this.info.deviceType).toLowerCase();
        deviceInformationClassList += String(this.info.deviceType).toLowerCase() === 'desktop' ? " is-desktop" : " is-mobile";

        document.documentElement.className = deviceInformationClassList;

        this.$get = ['$injector', function($injector) {
            var _info = this.info;
            _info.uuid = function() {
                var uuid = null,
                    $location = $injector.get('$location'),
                    cookies_enabled = false,
                    ca = null;
                document.cookie = 'cookies_enabled=true'
                var cookies = document.cookie.split('; ')
                for (i = 0; i < cookies.length; i++) {
                    ca = cookies[i].split('=');
                    if (ca[0] == 'uuid') {
                        uuid = ca[1]
                    }
                    if (ca[0] == 'cookies_enabled') {
                        cookies_enabled = true
                    }
                }
                if (cookies_enabled) {
                    if (!uuid && !$location.$$search.u) {
                        uuid = ''
                        for (var i = 0; i < 32; i++) {
                            uuid += Math.floor(Math.random() * 16).toString(16).toUpperCase()
                        }
                        document.cookie = 'uuid' + '=' + uuid + '; expires=Wed, 15 Dec 2038 19:49:32 GMT; path=/';
                    } else if (!uuid) {
                        uuid = $location.$$search.u
                        document.cookie = 'uuid' + '=' + uuid + '; expires=Wed, 15 Dec 2038 19:49:32 GMT; path=/';
                    }
                    return uuid
                } else {
                    return null
                }
            }()


            return {
                info: this.info
            }
        }]
    }

})(window.angular);
