/**
 * Created by ramor11 on 11/3/2016.
 */

import fs from 'fs';
import path from 'path';
import mime from 'mime';
import url from 'url';


const dir = `${__dirname}/../../build/releases`;


export function getLatestRelease() {

    return new Promise(function (resolve, reject) {

        const versionsDesc = fs.readdirSync(dir).map((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                let assets = [];
                fs.readdirSync(filePath).forEach(function (file) {
                    assets.push({
                        file: file,
                        content_type: mime.lookup(path.join(filePath, file)),
                        file_full_path: path.join(filePath, file),
                        // browser_download_url: getUrl(req)
                    })
                })
                return {
                    version: file,
                    path: filePath,
                    assets: assets
                };

            }

        }).reverse();

        resolve(versionsDesc[0])

    });

}


export function getUrl(req) {
    var urlobj = url.parse(req.originalUrl);
    urlobj.protocol = req.protocol;
    urlobj.host = req.get('host');
    return url.format(urlobj);
}