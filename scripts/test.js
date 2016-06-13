
var url  = "";

require(service.parse_url(url).scheme).get(url, function (res) {
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
        output += chunk;
    });

    res.on('end', function () {
        try {
            var obj = JSON.parse(output);
            // callback(res.statusCode, obj);
        } catch (e) {
        }

    });

}).on('error', function (e) {
    console.log('error', e)
    // callback(e);
});

