# Notice
This bot is deprecated, please see the newer, better [MomijiBot](https://github.com/NightmareX91/discord-momijibot).

# HoloBot
A Discord chat bot that will most likely not work for you? I dunno, it's geared towards FP WAYT's Discord server.

This bot uses [hydrabolt's discord.js](https://github.com/hydrabolt/discord.js). I will occasionally switch to the indev branch, so be careful!

Cheers to [Chalda](https://github.com/chalda/DiscordBot) and [SteamingMutt](https://github.com/SteamingMutt/DougleyBot) for providing a base for my lazy ass to work off.

# Installation

This bot is written to run on top of node.js. Please see https://nodejs.org/en/download/

Once you have node installed running `npm install` from the bot directory should install all the needed packages. If this command prints errors the bot won't work!

## Windows Users
Please note that you must have a working C compiler and Python in your path for
`npm install` to work. The bot has been tested to work on Windows using Visual Studio 2015 Community and Python 2.7.
* [Installing Node on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
* [npm errors on Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
* [Visual Studio Community 2015](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx)
* [Python 2.7](https://www.python.org/downloads/)

## Special instructions for setting up google search and youtube APIs:

(thanks @SchwererKonigstiger)

1) Create a Custom Search at: https://cse.google.com/cse/create/new

2) Leave the first line blank, and name the search engine anything you wish.

3) Click "Advanced Options" and then type ImageObject.

4) Hit create.

5) On this new page, enable the Image Search in the menu.

6) Then press "Search engine ID" under the Details header.

7) Copy this into the auth.json's "google_custom_search" section.

Make sure you also have your google server API key, which goes in the "youtube_api_key" section, or the search will fail.

# Running
Before first run you will need to create an `auth.json` file. The email and password for a discord account are required. The other credentials are not required for the bot to run, but highly recommended as commands that depend on them will malfunction. See `auth.json.example`.

To start the bot just run
`node discord_bot.js`.
