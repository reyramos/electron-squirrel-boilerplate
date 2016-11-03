/**
 * Created by ramor11 on 11/3/2016.
 */
import {getLatestRelease} from '../components/utils';


export async function latest(req, res) {
    const clientVersion = req.query.v;
    const latestRelease = await getLatestRelease(req);
    const response = {
        clientVersion: clientVersion,
        generatedAt: new Date(),
        latest: latestRelease
    };


    if (typeof latestRelease !== 'undefined' && typeof clientVersion !== 'undefined' && clientVersion !== latestRelease) {
        response.latest = Object.assign({}, latestRelease, {
            assets: latestRelease.assets.find(function (o) {
                if (o.file === 'RELEASES')
                    return o;
            })
        });

        res.setHeader('Content-type', response.latest.assets.content_type);
        res.download(response.latest.assets.file_full_path);
    }

    res.json(response);

}



export async function release(req, res) {
    const clientVersion = req.query.v;
    const latestRelease = await getLatestRelease(req);
    const response = {
        clientVersion: clientVersion,
        generatedAt: new Date(),
        latest: latestRelease
    };


    if (typeof latestRelease !== 'undefined' && typeof clientVersion !== 'undefined' && clientVersion !== latestRelease) {
        response.latest = Object.assign({}, latestRelease, {
            assets: latestRelease.assets.find(function (o) {
                if (o.file === 'RELEASES')
                    return o;
            })
        });

        res.setHeader('Content-type', response.latest.assets.content_type);
        res.sendfile(response.latest.assets.file_full_path);
    }else{
        res.json(response);

    }


}
