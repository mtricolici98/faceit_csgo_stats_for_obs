
# Faceit CS:GO Stats
This repository contains a small web page that can be used as a OBS Widget.

## How to use
 1. Download the files (unpack if necessary).
 2. Use start.bat to start the server (note: the server runs on port 8000).
 3. In OBS add a new browser source pointing to http://localhost:8000/index.html?nickname=YOUR_NICKNAME&api_key=YOUR_FACEIT_API_KEY
	
### Notes
 - Nicknames are case sensitive.
 - You are required to have your own Faceit api_key (client_side), visit [Faceit API Docs](https://developers.faceit.com/docs/auth/api_keys) for more information.

