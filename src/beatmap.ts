import axios from "axios";
import * as osu from 'node-osu';
import { join } from "path";
import { unzip, wrapTimeout } from "./utils";
import { Readable } from "stream";
import { createWriteStream, mkdirSync, readFileSync } from "fs";
import { createHash } from "crypto";

export async function downloadCustomBeatmapset(mapUrl: string, baseDir: string) {
    return await downloadBeatmapCustom(mapUrl, baseDir);
}

export async function downloadBeatmapById(setId: number, baseDir: string) {
    return await downloadBeatmapOnline(setId, baseDir);
}

export async function downloadBeatmapByHash(apiKey: string, beatmap_hash: string, baseDir: string) {
    let n = new osu.Api(apiKey, {});
    let beatmap = await n.getBeatmaps({ h: beatmap_hash }).then(b => b[0]);
    console.log(`Found beatmap w/ ID ${beatmap.id} : ${beatmap.artist} - ${beatmap.title}`);

    return await downloadBeatmapOnline(+beatmap.beatmapSetId, baseDir);
}

async function downloadBeatmapOnline(setId : number, baseDir: string) {
    console.log('Downloading beatmapset', setId)
    return await downloadBeatmap('https://osu.direct/api/d/' + setId, baseDir);
}

async function downloadBeatmapCustom(mapUrl: string, baseDir: string) {
    console.log('Downloading beatmapset from', mapUrl);
    return await downloadBeatmap(mapUrl, baseDir);
}

async function downloadBeatmap(mapUrl: string, baseDir: string) {
    let extract = getBeatmapsetPath(baseDir);
    mkdirSync(extract, { recursive: true });

    let osz = await axios.get(mapUrl, { responseType: 'arraybuffer' })
        .then(res => res.data as ArrayBuffer);

    console.log('Downloaded beatmap :', osz.byteLength, 'bytes');
    console.log('Beginning extraction...');

    await unzip(Buffer.from(osz), extract);
    console.log('Extraction complete!');
    return extract;
}

export function getBeatmapsetCollectionPath(baseDir: string) {
    return join(baseDir, 'songs');
}

export function getBeatmapsetPath(baseDir: string) {
    return join(getBeatmapsetCollectionPath(baseDir), 'beatmap');
}

export async function downloadCustomMap(mapUrl: string, baseDir: string) {
    console.log('Downloading custom map from', mapUrl);

    let extract = getBeatmapsetPath(baseDir);
    mkdirSync(extract, { recursive: true });

    let osu = await axios.get(mapUrl, { responseType: 'stream' })
        .then(res => res.data as Readable);

    let file = join(extract, 'custom.osu');
    let f = createWriteStream(file);

    let downloadPromise = wrapTimeout(15000, () => new Promise(res => {
        osu.on('end', res)
    }))

    osu.pipe(f);
    await downloadPromise;
    f.close();
    console.log(`Downloaded to`, file);

    let hash = md5(readFileSync(file));
    console.log('MD5 was', hash);
}

export function md5(b : Buffer) {
    let md5 = createHash('md5').update(b).digest('hex');
    return md5;
}
