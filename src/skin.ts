import axios from 'axios';
import { join } from 'path';
import { unzip } from './utils';

export async function downloadSkin(skinUrl: string, baseDir: string) {
    console.log('Downloading skin from', skinUrl)
    let zip = await axios.get(skinUrl, {
        responseType: 'arraybuffer'
    })
        .then(res => {
            return res.data as ArrayBuffer;
        })

    console.log('Downloaded skin :', zip.byteLength, 'bytes');
    console.log('Beginning extraction...');

    let output_path = getSkinDir(baseDir);
    unzip(Buffer.from(zip), output_path);
    console.log('Extraction complete!');
    return output_path;

}

export function getSkinDir(baseDir: string) {
    return join(getSkinBaseDir(baseDir), 'skin');
}

export function getSkinBaseDir(baseDir: string) {
    return join(baseDir, 'skin');
}