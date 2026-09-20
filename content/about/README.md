# About page uploads

The live About page reads `index.json` and each member's `profile.json`. No HTML editing is needed.

## Studio image
Upload one image to `studio/`, for example `studio.jpg`. In `index.json`, change `studio.image` to `content/about/studio/studio.jpg`. Update the alt description, caption and credit there too. A wide landscape photograph around 2000 pixels across works well. The current landscape is a placeholder.

## Four team members
Folders: `team/member-01/` through `team/member-04/`.

In each folder:
- Upload the main portrait, e.g. `a.jpg`, and the personal/fun-fact image, e.g. `b.jpg`.
- Edit `profile.json`: set `portraitA` to `a.jpg` and `portraitB` to `b.jpg` (filenames only, case sensitive).
- Replace `name`, `role`, and the `bio` paragraphs.
- Set `bTitle`, `bCaption`, and `bLabel` for the hover panel. Keep these short.
- Describe the images in `portraitAlt` and `bAlt` for accessibility.

The A-side is square-cropped. The B-side shows the full image. Existing a.svg and b.svg are placeholders; leave them until the replacement files are uploaded and JSON is updated.

The member order is controlled by the `members` array in `index.json`. The current layout keeps four members, with deliberate blank space. Hover with a mouse, or tap/click/press Enter on a portrait to inspect the B-side. Escape or the close button dismisses it. The panel uses a translucent dark surface and a fine white outline in both themes.

Commit your uploads and JSON edits to main; GitHub Pages publishes them automatically.
