# Page turn engine

StPageFlip / npm `page-flip` 2.0.7, distributed under the MIT license.

- Source: https://github.com/Nodlik/StPageFlip
- Package: https://www.npmjs.com/package/page-flip/v/2.0.7
- Browser build: `page-flip-2.0.7.browser.js`, based on the npm distribution verified against its SHA-512 integrity value.
- License: `page-flip-LICENSE.txt`

`assets/comic-reader.js` connects the book to project content. Spread images remain intact; the two halves are displayed on physical pages using CSS.

The local browser build adds render-loop cleanup: the renderer stores its animation frame, checks a stopped flag before drawing or scheduling, and cancels the frame when `PageFlip.destroy()` runs. This fixes the upstream 2.0.7 behavior that keeps drawing detached pages after a reader is destroyed. No page geometry or artwork rendering was changed.
