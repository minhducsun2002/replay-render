import axios from "axios";
import { createWriteStream, readFileSync } from "fs";
import { join } from "path";
import { Readable } from "stream";
import { wrapTimeout } from "./utils";
import { Replay } from "@minhducsun2002/node-osr-parser";

export async function downloadReplay(replayUrl: string, baseDir: string) {
    let p = getReplayPath(baseDir);

    let replay = await axios.get(replayUrl, {
        responseType: 'stream'
    })
        .then(res => {
            return res.data as Readable;
        })
    console.log('Downloading replay from', replayUrl);
    let fs = createWriteStream(p);

    let downloadPromise = wrapTimeout(15000, () => new Promise(res => {
        replay.on('end', res)
    }))

    replay.pipe(fs);
    await downloadPromise;
    fs.close();

    return p;
}

export function getReplayPath(baseDir: string) {
    return join(baseDir, 'replay.osr');
}

export async function parseReplay(path: string) {
    let p = readFileSync(path);
    let r = await new Replay(p).deserialize();

    return r;
}