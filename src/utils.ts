import { mkdirSync, createWriteStream } from "fs";
import { dirname, join } from "path";
import { Entry, fromBuffer } from "yauzl-promise";

export function wrapTimeout<T>(timeoutMs: number, m: () => Promise<T>) {
    return new Promise((res, rej) => {
        let timeout = setTimeout(() => rej(`Promise timed out after ${timeoutMs}ms`), timeoutMs);

        m()
            .then(result => {
                clearTimeout(timeout);
                res(result);
            })
            .catch(a => {
                clearTimeout(timeout);
                rej(a);
            });
    })
}

export async function unzip(b: Buffer, baseDir: string) {
    let output_path = baseDir;
    let d = await fromBuffer(b);

    for await (const entry of d as any as AsyncIterable<Entry>) {
        let fileName = (entry as any)['filename'] as string;
        let path = join(output_path, fileName);

        if (fileName.endsWith('/')) {
            mkdirSync(path, { recursive: true });
        } else {
            let p = dirname(path);
            mkdirSync(p, { recursive: true });
            const readStream = await entry.openReadStream();
            const writeStream = createWriteStream(path);

            let complete = () => new Promise<void>(res => {
                readStream.on('end', () => {
                    writeStream.close();
                    res();
                })
            })

            readStream.pipe(writeStream);
            await wrapTimeout(5000, complete);
        }
    }

    d.close();
}