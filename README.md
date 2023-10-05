# reaper-remote-bandui

[![License](https://img.shields.io/github/license/nikarh/reaper-remote-bandui.svg)](https://github.com/nikarh/reaper-remote-bandui)
[![GitHub Actions Build Status](https://github.com/nikarh/reaper-remote-bandui/actions/workflows/release.yml/badge.svg)](https://github.com/nikarh/reaper-remote-bandui/actions/workflows/release.yml)
[![Current Release](https://img.shields.io/github/release/nikarh/reaper-remote-bandui.svg)](https://github.com/nikarh/reaper-remote-bandui/releases)
[![Release RSS Feed](https://img.shields.io/badge/rss-releases-ffa500?logo=rss)](https://github.com/nikarh/reaper-remote-bandui/releases.atom)
[![Main Commits RSS Feed](https://img.shields.io/badge/rss-commits-ffa500?logo=rss)](https://github.com/nikarh/reaper-remote-bandui/commits/main.atom)

My musical band uses an IEM setup for rehearsals and live shows.
This setup is based on a [USB audio interface](https://www.behringer.com/product.html?modelCode=P0B2J) and software mixing in [REAPER](https://www.reaper.fm/).

In REAPER we use named regions for songs, and simple sends from input channels to personal channels with a hardware output for each band member.

To simplify mixing we use a web control feature of REAPER and each band member does mixing of their output from a phone. Fortunately, REAPER already includes an interface that allows doing just that - `more_me.html`. Unfortunately, though, this interface doesn't allow switching tracks or starting or stopping playback.

This project aims to fix that by providing a mobile-first web UI that provides a way to:

- Control playback
- Switch between songs
- Mix inputs for different band members

## Repository contents

This repository contains

- Source code for REAPER remote control web UI
  | Control | Mix |
  | --- | --- |
  | ![Screenshot of a Control tab](./screenshots/Web%20-%20Control.png) | ![Screenshot of a Mix tab](./screenshots/Web%20-%20Mix.png) |
- `Mother Project.RPP` - A sample reaper project that can be used with this UI

  ![Screenshot of a REAPER project](./screenshots/Reaper%20Project.png)

## Remote UI

### Building

Clone the project, install the dependencies and build it with an npm command.

```
git clone https://github.com/nikarh/reaper-remote-bandui.git
npm i
npm run dist
```

The built HTML file will be in `./dist/index.html`.

### Development

This project does not have a mock backend, so you actually need to run REAPER with the provided `Mother Project`, if you want to see anything sensible.
By default proxy server expects REAPER to be running on port `8881`.

## REAPER project layout

For this UI to work, your REAPER project must follow some rules.

1. All songs are marked as regions from the beginning to the end. The region must have a name.
2. Tracks for which mixing is possible must have both

   - A hardware output
   - At least one send

   During the mixing process, the UI would change the gain of individual sends.

The example project has some more tracks so here is a brief explanation of their purpose.

- A MIDI track is used for song markers (like chorus and verse). In my experience using REAPER markers for that would cause too much of a mess
- Click track is used for `Click source` items or simply put metronome. The global metronome usually doesn't cut it, because each band member usually prefers a different loudness for it (e.g. it's very important for a drummer but not so much for a vocalist)
- The audio group is for tracks where you would put pre-recorded WAV files, like backtracks and vocal backtracks
- The input group is for tracks having a physical input source, like a guitar or a microphone. If any additional processing is needed (compression, eq, reverb), it should be put on these tracks
- The output group is for tracks with physical outputs. All of these tracks have plugins for basic hearing safety - a `-10 dB` gain and a brick-wall limiter at `0 dB`. These tracks have "Receives" from input group tracks and audio group tracks.
