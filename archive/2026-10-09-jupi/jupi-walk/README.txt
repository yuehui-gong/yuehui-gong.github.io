Jupi walk update
Built-in image generation, using the existing walk sprite as reference.
Prompt summary: a 4-by-3 transparent pixel-art sheet of Jupi with 12 sequential right-facing walking poses; alternating contact, passing, lift and swing phases; consistent size and paw baseline; no white outline.
Integration: 128px frames, 102px artwork width, baseline y=116. One cycle per 0.42 sprite-width distance. Speed eases toward a variable target; spontaneous rest/glance pauses suspend movement and stride progress. Originals generated to outputs/jupi-walk-atlas.png; production frames in assets/jupi-walk/ and embedded in jupi.html.
Validation: 12 decoded walk frames, exact stride-distance tracking, stationary pause, both backgrounds, no runtime errors. Alpha threshold and small-component cleanup preserve opaque white fur while reducing edge artifacts.
