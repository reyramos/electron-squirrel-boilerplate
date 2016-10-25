var path = require('path'),
    config = require("../electron.config.js"),
    helpers = require("./helpers"),
    package = require("../package.json");

config['build_date'] = new Date().toJSON();


const APPLICATION_SRC = helpers.root(config.source);

const VARIABLES = Object.assign({}, {
    "productName": config.app_name,
    "description": config.app_description,
    "author": config.manufacturer,
    "version": String(config.version).trim(),
}, package);


module.exports = {
    'versionString': {
        'CompanyName': VARIABLES.productName,
        'LegalCopyright': VARIABLES.author,
        'FileDescription': VARIABLES.description,
        'OriginalFilename': config.exeName + '.exe',
        'FileVersion': VARIABLES.version,
        'ProductVersion': VARIABLES.version,
        'ProductName': VARIABLES.productName,
        'InternalName': VARIABLES.productName,
    },
    'productVersion': VARIABLES.version,
    'fileVersion': VARIABLES.version,
    'icon': path.join(APPLICATION_SRC, 'app', 'icon.ico')
};

