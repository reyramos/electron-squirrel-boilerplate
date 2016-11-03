/**
 * Created by ramor11 on 11/3/2016.
 */
import {getLatestRelease} from '../components/utils';


export async function main(req, res) {
    const latestRelease = await getLatestRelease(req);
    res.json({
        generatedAt: new Date(),
        latest: latestRelease
    });
}
