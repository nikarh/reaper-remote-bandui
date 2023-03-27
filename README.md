# What is this?

My musical band uses an IEM setup for rehersals and live shows.
This setup is based on a [USB audio interace](https://www.behringer.com/product.html?modelCode=P0B2J) and software mixing in [Reaper](https://www.reaper.fm/).

In Reaper we use named regions for songs, and simple sends from input chanels to personal chanels with a hardware output for each band member.

To simplify mixing we use a web control feature of Reaper and each band member does mixing of their own output from a phone. Fortunately Reaper already includes an interface allows doing just that - `more_me.html`. Unfortunately though, this interace doesn't allow switching tracks or starting or stopping playback.

This project aims to fix that by providing a webui that allows:

- Allows to start/stop playback
- Provides a list of all regions in a project and allows moving cursor to the beginning of a region
- Mixing sends for all tracks that have a hardware output

## Repository contents

This repository contains
- Source code for REAPER remote control web UI
  | Control | Mix |
  | --- | --- |
  | ![Screenshot of a Control tab](./screenshots/Web%20-%20Control.png) | ![Screenshot of a Mix tab](./screenshots/Web%20-%20Mix.png) |
- `Mother Project.RPP` - A sample reaper project that can be used with this UI
  
  ![Screenshot of a REAPER project](./screenshots/Reaper%20Project.png)

## Building

Clone the project, install the dependencies and build it with an npm command.

```
git clone https://github.com/nikarh/reaper-remote-bandui.git
npm i
npm run dist
```

The built HTML file will be in `./dist/index.html`.

## Development

This project does not have a mock backend, so you actually need to run REAPER with the provided `Mother Project`, if you want to see anything sensible.
By default proxy server expects REAPER to be running on port `8881`.
