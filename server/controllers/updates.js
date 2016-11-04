/**
 * Created by ramor11 on 11/3/2016.
 */
import {getLatestRelease} from '../components/utils';

export async function latest(req, res) {
    const latestRelease = await getLatestRelease(req);
    const fileName = req.params.name;

    const response = {
        clientVersion: req.query.localVersion,
        generatedAt: new Date(),
        latest: latestRelease,
        fileName: fileName
    };


    response.latest = Object.assign({}, latestRelease, {
        assets: latestRelease.assets.find(function (o) {
            if (o.file === fileName)
                return o;
        })
    });

    var options = {
        root: latestRelease.path,
        dotfiles: 'deny',
        headers: {
            'Content-type': response.latest.assets.content_type
        }
    };

    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });

}

