from osr2mp4.osr2mp4 import Osr2mp4

data = {
   "osu! path": "/",
   "Skin path": "/home/runner/skin",
   "Beatmap path": "/home/runner/beatmap/",
   ".osr path": "/home/runner/replay.osr",
   "Default skin path": "/home/runner/skin-default",
   "Output path": "/home/runner/output.avi",
   "Width": 1920,
   "Height": 1080,
   "FPS": 60,
   "Start time": 0,
   "End time": -1,
   "Video codec": "XVID",
   "Process": 3,
   "ffmpeg path": "/usr/bin/ffmpeg", "enablelog":False,
"Show scoreboard": False
 }

settings = {
"enablelog":False,
"Show scoreboard":False, "Audio bitrate" : 128,
"In-game interface":False,
        "Global leaderboard": False,
        "Song volume": 100,
        "Effect volume": 100,
        "Enable PP counter": False,
        "Use FFmpeg video writer": True,
        "api key": "",
    }


converter = Osr2mp4(data, settings)
converter.startall()
converter.joinall()
