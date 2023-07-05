import { readFileSync } from "fs";
import klawSync from "klaw-sync";
import { basename } from "path";
import { md5 } from "./beatmap";

export function parse(s: string) {
    let l = s.split('\n');

    let result = {
        title: '',
        artist: '',
        version: '',
    }
    for (let line of l) {
        let [key, value] = line.split(':');
        switch (key) {
            case 'Title': {
                result.title = value.trim();
                break;
            }
            case 'Artist': {
                result.artist = value.trim();
                break;
            }
            case 'Version': {
                result.version = value.trim();
                break;
            }
        }
    }

    return result;
}

export function scanForBeatmapFile(workdir: string, hash: string) {
    console.log('Scanning', workdir, 'for beatmap with md5', hash);
    let f = klawSync(workdir, {
        nodir: true,
        nofile: false,
        depthLimit: 10,
        filter: (i) => {
            if (i.stats.isDirectory()) {
                return true;
            }
            return i.path.endsWith('.osu');
        }
    })

    let target = hash.toLowerCase();
    for (let item of f) {
        let h = md5(readFileSync(item.path)).toLowerCase();
        if (h === target) {
            console.log('Found matching beatmap at', item.path);
            let f = readFileSync(item.path, 'utf-8');
            return parse(f);
        }
    }

    throw new Error("Matching beatmap not found");
}