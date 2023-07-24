import axios from "axios";
import { unzip } from "./utils";
import { basename, join } from "path";
import { chmodSync, mkdirSync, writeFileSync } from "fs";
import { getDefaultSettings } from "./danser_default_setting";
import { getSkinBaseDir, getSkinDir } from "./skin";
import { getBeatmapsetCollectionPath } from "./beatmap";
import { execFileSync } from "child_process";
import { getReplayPath } from "./replay";
import { Database } from "sqlite3";

const danser_url = 'https://github.com/Wieku/danser-go/releases/download/0.8.4/danser-0.8.4-linux.zip';

export async function prepareDanser(baseDir: string) {
    console.log('Downloading danser from', danser_url);
    let b = await axios.get(danser_url, { responseType: 'arraybuffer' })
        .then(r => r.data as ArrayBuffer);

    let p = getDanserBasePath(baseDir); mkdirSync(p, { recursive: true });
    console.log('Downloaded! Extracting...');
    await unzip(Buffer.from(b), p);

    console.log('Extraction complete! Writing configuration...');
    let settings = getDefaultSettings();
    settings.General.OsuSkinsDir = getSkinBaseDir(baseDir);
    settings.Skin.CurrentSkin = basename(getSkinDir(baseDir));
    settings.General.OsuSongsDir = getBeatmapsetCollectionPath(baseDir);
    settings.Recording.OutputDir = getVideoOutputBasePath(baseDir);

    let settingsDir = join(p, 'settings'); mkdirSync(settingsDir, { recursive: true });
    writeFileSync(join(settingsDir, 'default.json'), JSON.stringify(settings));
}

function getDanserBasePath(baseDir: string) {
    return join(baseDir, 'danser');
}

function getVideoOutputBasePath(baseDir: string) {
    return join(baseDir, 'video');
}

export function getVideoOutputFile(baseDir: string) {
    return join(baseDir, 'video.mp4');
}

export async function render(baseDir: string) {
    let p = getDanserBasePath(baseDir);
    let binary = join(p, 'danser-cli');
    chmodSync(binary, 0o755);
    execFileSync(binary, ['-record', '-replay', getReplayPath(baseDir), '-out', "video"], {
        stdio: ['inherit', 'inherit', 'inherit'],
        cwd: p,
    });
}

export async function getMeta(md5: string, workdir: string) {
    let danserDb = join(getDanserBasePath(workdir), 'danser.db');
    let n = new Database(danserDb);
    return await new Promise<{
        title: string,
        artist: string,
        version: string
    }>(rr => {
        n.get(`select * from 'beatmaps' where md5 = '${md5}'`, (e, r) => {
            rr(r as any);
        })
    })
}