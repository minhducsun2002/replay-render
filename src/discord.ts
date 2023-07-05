import type { Replay } from "@minhducsun2002/node-osr-parser";
import type { scanForBeatmapFile } from "./parser";
import { EmbedBuilder, WebhookClient } from "discord.js";

let gameModes = ['osu!', 'osu!taiko', 'osu!catch', 'osu!mania'];

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const link = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`

export async function sendInfo(r : Replay, p: ReturnType<typeof scanForBeatmapFile>, webhookUrl: string, starting: boolean) {
    if (!webhookUrl) {
        return;
    }
    let webhookClient = new WebhookClient({ url: webhookUrl });

    if (starting) {
        await webhookClient.send({
            content: 'Rendering started!\nSee ' + link,
            username: r.player,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${p.title} [${p.version}]`)
                    .setAuthor({ name: p.artist })
                    .setTimestamp(r.timestamp)
                    .setDescription(`combo : ${r.maxCombo}x${r.perfect ? ' [FC]' : ''} | mods : ${r.mods} | score : ${r.score}`)
                    .setFooter({
                        text: gameModes[r.gamemode] + ' | ver ' + r.version
                    })
            ]
        })
    } else {
        await webhookClient.send({ content: 'Rendering finished! See ' + link });
    }
}