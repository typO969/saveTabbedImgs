# README.md - saveTabbedImgs

## I. INSTALLATION INSTRUCTIONS
1. Download all files to a unique local folder. 
  *(If necessary move the folder to somewhere else other than your default Downloads folder.)*
2. Open Manage Chrome Extensions, or type "chrome://extensions/" in the address bar.
3. Enable developer mode.
4. Click Load Unpacked.
5. Select the folder you downloaded the extension to.
  *(Ignore the 'minified' error, it still runs fine.)*
##

## II. METHODOLOGY
Having been completley oblivious that the original extension source was here on github (https://github.com/kevinsqi/save_tabbed_images), I created this version/variation for myself around September of 2024 for the challenge, experience, and knowledge. It ranks as my second completed extension and first for manifest 3.
It began with updating the manifest to version 3 and quickly realized I would have to modify and add a significant amount of JS to compliment the other changes google made between manifests.
Just for funsies, I did some quick file comparisons in Np++, between ***background.js*** files:
```
  * 128 Diff Lines:
  * 62 Added, 69 Removed, 13 Changed.
  * 3 Match
```     
and between the original ***index.js*** and mine:
```
  * 75 Diff Lines:
  * 6 Added. 50 Removed, 2S Changed.
  * 10123 Match
```

The background service(s) had to be almsot entirely re-written to cover the changes from manifest 2 to manifest 3. Thankfully, not much needed to be changed in the monster index javascript file. 
I used copilot and GPT  to help me find said changes in ***index.js*** (original is 10,155 lines long).
Originally, I was hoping I would only have to change manifests, which the original was:
```
{
"update_url": "https://clients2.google.com/service/update2/crx",

  "name": "Save Tabbed Images",
  "description": "Save images currently opened in tabs.",
  "version": "0.7.0",
  "minimum_chrome_version": "16.0.884",
  "manifest_version": 2,
  "permissions": [
    "downloads",
    "tabs",
    "<all_urls>",
    "webRequest",
    "activeTab",
    "*://*/*"
  ],
  "browser_action": {
    "default_popup": "index.html",
    "default_icon": "img/icon16.png"
  },
  "icons": {
    "16": "img/icon16.png",
    "48": "img/icon48.png",
    "128": "img/icon128.png"
  },
  "background": {
    "scripts": ["js/background.js"],
    "persistent": true
  },
  "incognito": "split"
}
```

and then how it has to be changed for version 3:
```
{
    "update_url": "https://clients2.google.com/service/update2/crx",
    "name": "Save Tabbed Images",
    "description": "Save images currently opened in tabs.",
    "version": "1.0.0",
    "minimum_chrome_version": "88",
    "manifest_version": 3,
    "permissions": [
        "downloads",
        "tabs",
        "activeTab",
        "webRequest",
        "scripting"
    ],
    "action": {
        "default_popup": "index.html",
        "default_icon": "img/icon16.png"
    },
    "icons": {
        "16": "img/icon16.png",
        "48": "img/icon48.png",
        "128": "img/icon128.png"
    },
    "background": {
        "service_worker": "js/background.js"
    },
    "host_permissions": [
        "*://*/*"
    ],
    "incognito": "split"
}
```
##

## III. IMPROVEMENTS
  1. Added a more clear manner in background.js in which to view and change image/file types that are allowed to be downloaded.
  2. Removed the restrictions on using special characters in folder names when saving. Kept only illegal characters as forbidden.
  3. MV3 service worker: moved to a service-worker context; no bundler wrapper/modules (chrome = r(19), getTabsWithImages)—now plain script; note about non-persistent state.
  4. State handling: replaced o[tabId] with tabContentTypes[tabId] (in-memory map) and documented that it’s volatile.
  5. Header logic kept, but inlined: getContentTypeHeader implemented locally; same onHeadersReceived filter (main_frame, all URLs).
  6. Console debug: added console.log for URL and content type.
  7. Async messaging fix: added return true after sendResponse to keep the port open (correct for MV3).
  8. Regex improved: extension test now also matches query formats like ?format=jpg (fallback when no header info).
  9. Policy change for WebM: video/webm and .webm switched from allowed → not allowed (were treated as image before; now excluded).
  10. Behavior when header seen but not allowed: explicitly stores false (same practical effect as before—prevents extension fallback once headers were processed).
  11. Minor cleanup: clearer names (allowedContentTypes, allowedExtensions, resultTabs), removed unused exports, simplified flow.

## IV. NOTES
* It still consistently throws minified warning errors, but it doesn't seem to have any affect on funcitonality or usability.
* Every once in a while it gets confused while saving large qunatities of large image files and throws a read only error.
* I'm sure there are probably many others, but none seem to brick the extension.
