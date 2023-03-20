# What is this?

My musical band uses an IEM setup for rehersals and live shows.
This setup is based on a [USB audio interace](https://www.behringer.com/product.html?modelCode=P0B2J) and software mixing in [Reaper](https://www.reaper.fm/).

In Reaper we use named regions for songs, and simple sends from input chanels to personal chanels with a hardware output for each band member.

To simplify mixing we use a web control feature of Reaper and each band member does mixing of their own output from a phone. Fortunately Reaper already includes an interface allows doing just that - `more_me.html`. Unfortunately though, this interace doesn't allow switching tracks or starting or stopping playback.

This project aims to fix that by providing a webui that allows:
- Allows to start/stop playback
- Provides a list of all regions in a project and allows moving cursor to the beginning of a region
- Mixing inputs for all tracks that have a hardware output

