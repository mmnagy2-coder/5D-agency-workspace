# Agency workspace prototype

A white-label creative workspace that sits inside a client brand's own team, with the agency (5D) working from inside it. It is built from the brief *The agency inside the client's workplace* and populated with Qamari, a fictional date and sweets brand, so it can be shown before a pilot client exists.

This is a prototype. Every engine is simulated: copy, dialect versions, visuals, publishing and performance data are produced in the browser. The integration points for the live product are in `src/lib/engines.js`.

## Run it

```
npm install
npm run dev
```

Open the address Vite prints. Use the role switch in the top bar to move between Karim (content executive, makes), Layla (marketing manager, approves) and Omar (5D account lead). Work is saved in the browser. "Reset demo data" at the bottom of the left rail restores the starting state.

## What each part of the brief does

| Brief | Where it lives |
| --- | --- |
| Holds all the client's collateral and assets | Library, Brand kit |
| Templates for every media channel | Templates, `src/config/channels.js` |
| Prompt for what you need, with brand elements | Create, with @tags for characters, products and styles |
| Created on brand | Concepts built from the brand kit, rules enforced in the brand check |
| One button formats for every channel | Format for every channel, eight delivery sizes, safe zones, PNG export |
| Check dates and times, then approve | Check and schedule, Review and approve, Calendar |
| Goes out through the client's channels | Channels, organic scheduling, paid handover to 5D's media team |
| The agency troubleshoots and creates new assets | Ask 5D, Agency desk, template builder, library delivery |
| Puts new work into the client's interface | Templates and assets published by 5D appear marked as new |
| Results against the old way | Reports |

## White label

The client is a configuration, not a fork.

`src/config/brand.js` holds the client's name, palette, type, voice, rules, @tag elements and dialects. `src/main.jsx` writes the shell's colour and display face from it at start-up.

`src/config/agency.js` holds the agency name, people and engines. Rebranding the platform as a 5D product is a change to this file and to the shell tokens at the top of `src/styles.css`.

The drawn illustrations in `src/creative/motifs.jsx` stand in for generated imagery. In the live product they are replaced by images from the image engine, built from the brand's saved characters, products and styles.

## Arabic

The interface runs in English or Egyptian Arabic, switched from the top bar, and the choice is remembered. In Arabic the whole layout mirrors, the week starts on Saturday, and verbs agree with the person using the screen or the person who acted.

Interface strings live in `src/i18n/en.js` and `src/i18n/ar.js`. Content carries Arabic in a sibling field (`title` and `titleAr`, `name` and `nameAr`), and `L(obj, 'title')` picks the right one. Notifications and history are stored as keys with values, so they read in whichever language the viewer has chosen.

Briefs can be written in either language. An Arabic brief is understood the same way as an English one, routed to the agency on the same triggers, checked against the Arabic blocked words in the brand voice, and defaults Instagram to Egyptian Arabic. Artwork language is set per channel and does not follow the interface.

## What has to change before a real client uses it

Data moves from browser storage to a shared backend with sign-in and roles, so the client's team, the approver and the agency see the same work. Engine keys and platform tokens move to the server. Publishing goes through each network's own API behind the approval gate. Reporting reads real performance against a baseline both sides sign before the pilot.
