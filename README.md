# A Walk Through Us

A small, browser-based 3D memory gallery built with React, Vite, Three.js, and React Three Fiber. The world is navigable rather than a scrolling page; use the room menu to move directly between rooms, or explore with the controls.

## Run locally

1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the local URL Vite prints.
4. Run `npm run build` to create the production site in `dist/`.

No database, account, analytics, or message-sending service is used. Music is synthesized locally in the browser and only starts after the music control is used.

## Controls

- **Desktop:** Up/W walks forward, Down/S walks backward, Left/A turns left, and Right/D turns right. Follow the glowing floor arrows down the hallway; walls and room boundaries block walking.
- **Touch:** use the arrow pad at the bottom of the screen: up/down walk forward/back, left/right turn.
- Use **Rooms** to jump to any room, **Entrance** to return, and the mini-map to see the current room.
- The music control has a mute toggle and volume slider.

The room menu is the quickest way to move between rooms. Walking is constrained to the hallway and room interiors, with open doorways connecting them.

## Personalize the gallery

Edit `src/data.ts`:

- Replace the example relationship date, captions, and sample messages before sharing.
- Change `relationshipStart` and edit the Future Plans message in `futurePlans.closing`.
- Update `memories` with your own words, dates, and categories; `thingsILove` is a name-only list.
- Edit `apologyLetter` directly. It is shown as provided; there is no forgiveness prompt.
- Room names and their initial positions are in `rooms`.

### Add photographs

1. Copy your image into `public/assets/` (JPG, PNG, or WebP work well).
2. Set the corresponding `image` field in `src/data.ts` to `"/assets/your-photo.jpg"`.
3. Add another object to `memories` to create a clickable card and a framed picture in that room. Photos are distributed across all four walls; additional rows stack vertically as needed. Every memory remains available in the room's detail list. Set `room`, `category`, `date`, `caption`, and `description`.

The gallery contains personal memories and photos only; the generic sample memory cards have been removed. Memories include the first time over at Ava's bed party, Yama Sushi, Hawkins Park, Joey's birthday at La Cucina Nouveau, Spring Lake, the City/Syracuse/Red Bank outings, the vampire Halloween party, building the Lego bears, New Year's, the first Weeknd concert, signing day, Long Branch after Monmouth University, Relay for Life, the SHU meet, soccer games, getting Tutto, a car selfie, Christmas at Emma's house, New Balance Nationals, the Toast brunch, and junior and senior prom. **The Little Things** room is a photo-only wall of ongoing support and small everyday memories, with a clickable photo list in its room panel. Keep images reasonably sized (around 1600px wide or less) for mobile performance. The file names may be changed as long as the data path is updated.

### Add milestones or rooms

Edit `thingsILove` in `src/data.ts` to personalize the Things I Love About You room; each entry displays only its name. To add a room, add a `Room` to `rooms` in `src/data.ts` with a unique id, position, and `left` or `right` side; its shell, hallway doorway, map marker, and menu entry are generated from that data. Add `memories` with the same room id to populate its clickable frames and detail list.

## Publish privately

This project does not publish itself. To share it, build the `dist/` folder and deploy it to a static host you choose (for example, a private/unlisted deployment on a hosting provider). Check that provider's privacy and access-control options before uploading personal photos: an unlisted URL is not the same as password protection. Do not upload anything until you are comfortable with the host and the intended audience.

For a basic deployment, run `npm run build`, create a static-site project with your chosen host, and set its build command to `npm run build` and output directory to `dist`. Leave deployment disabled until you are ready; then use the host's password/access-control setting if you need a genuinely private link.
