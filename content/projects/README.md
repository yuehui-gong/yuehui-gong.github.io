# Project content

The landing page, orbit gallery, project page, and awards page now read published project records here. Existing sample projects remain inline until replaced.

For each new project:
1. Create a folder with a short lowercase name, such as `the-latent-ground`.
2. Copy its `info.json` as a template and edit the text. Keep `slug` identical to the folder name.
3. Upload web-size images into the same folder. Use their filenames in `hero.file` and `images[].file`.
4. Add the folder name to `index.json`. Commit the changes; GitHub Pages publishes them automatically.

Coordinates are `[longitude, latitude]` and locate the project on the globe. Descriptions are an array of paragraphs. An empty collaborators array displays a dash. An empty awards array adds no awards entry. `summary` is the short sidebar introduction; `description` is the full narrative beneath the images.

For The Latent Ground, the two original uploads are preserved in `originals/`. The website uses resized JPEGs outside that subfolder. The perspective sheet is displayed in full, without cropping; the master plan retains its original proportions.

Still to confirm for The Latent Ground: collaborator names, image credits, and preferred project category (currently “Landscape design”). The map coordinates are an approximate site position.
