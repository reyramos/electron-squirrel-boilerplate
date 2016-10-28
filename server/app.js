'use strict';
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();

app.use(require('morgan')('dev'));

app.use('/releases', express.static(path.join(__dirname, '..', 'build', 'releases')));

app.get('/updates/latest/**', (req, res) => {
    const latest = getLatestRelease();
    const clientVersion = req.query.v;

    // if (clientVersion === latest) {
    //     res.status(204).end();
    // } else {
        res.json({
            url: `${getBaseUrl()}/releases/${latest}/phoenix.zip`
        });
    // }
});

let getLatestRelease = () => {
    const dir = `${__dirname}/../build/releases`;

    const versionsDesc = fs.readdirSync(dir).filter((file) => {
        const filePath = path.join(dir, file);
        return fs.statSync(filePath).isDirectory();
    }).reverse();

    return versionsDesc[0];
}

let getBaseUrl = () => {
    return 'http://localhost:9000'
}

app.listen(9000, () => {
    console.log(`Express server listening on port 9000`);
});