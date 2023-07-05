import { parseReplay, downloadReplay } from "./replay";
import { downloadSkin } from "./skin";
import { mkdirSync } from "fs";
import { config } from 'dotenv';
import { downloadBeatmapByHash, downloadBeatmapById, downloadCustomBeatmapset, downloadCustomMap, getBeatmapsetCollectionPath } from "./beatmap";
import { getMeta, prepareDanser, render } from "./danser";
import { scanForBeatmapFile } from "./parser";
import { resolve } from "path";
import { sendInfo } from "./discord";

config();

let skin = process.env.SKIN_URL ?? 'https://cdn.discordapp.com/attachments/876678911990308924/879340922918297670/Blueberry-v1.3.2-mod-normal-trails.osk';
let replay = process.env.REPLAY_URL ?? 'https://cdn.discordapp.com/attachments/876678911990308924/876678956529639454/Akane_Butterfly_-_Imperial_Circus_Dead_Decadence_-_Uta_Poetry_2021-06-02_Osu.osr';
let apiKey = process.env.API_KEY;
let overwriteSetId = +process.env.SET_ID ? +process.env.SET_ID : 0;
let overwriteSetLink = process.env.OVERWRITE_BEATMAPSET_LINK;
let overwriteMapLink = process.env.OVERWRITE_MAP_LINK;
let webhook = process.env.WEBHOOK_URL;

let workdir = './work';
workdir = resolve(workdir);

function logSection(title: string) {
    let len = 30;
    let d = len - title.length - 2;
    let left = d / 2, right = d - left;
    console.log('='.repeat(left), title, '='.repeat(right));
}

async function main() {
    mkdirSync(workdir, { recursive: true });
    logSection('PREPARE SKIN')
    let skinPath = await downloadSkin(skin, workdir);
    logSection('SKIN DONE');

    console.log();

    logSection('PREPARE REPLAY')
    let replayPath = await downloadReplay(replay, workdir);
    console.log('Downloaded replay to', replayPath);
    logSection('REPLAY DONE')

    let parsedReplay = await parseReplay(replayPath);
    console.log();
    console.log(`Replay by ${parsedReplay.player} on ${parsedReplay.md5map} at ${parsedReplay.timestamp.toLocaleString('vi-VN')}`);
    console.log();

    logSection('PREPARE BEATMAP');
    if (overwriteSetLink) {
        await downloadCustomBeatmapset(overwriteSetLink, workdir);
    } else {
        if (overwriteSetId) {
            await downloadBeatmapById(overwriteSetId, workdir);
        } else {
            await downloadBeatmapByHash(apiKey, parsedReplay.md5map, workdir);
        }
    }

    if (overwriteMapLink) {
        console.log();
        await downloadCustomMap(overwriteMapLink, workdir);
    }

    let meta = scanForBeatmapFile(getBeatmapsetCollectionPath(workdir), parsedReplay.md5map);

    logSection('BEATMAP DONE');

    console.log();

    logSection('PREPARE DANSER');
    await prepareDanser(workdir);
    logSection('DANSER DONE');

    console.log();
    try {
        await sendInfo(parsedReplay, meta, webhook, true);
    } catch (e) { console.log(e) }

    logSection('RENDER');
    await render(workdir);
    logSection('RENDER DONE');

    try {
        await sendInfo(parsedReplay, meta, webhook, false);
    } catch (e) { console.log(e) }
}

main();