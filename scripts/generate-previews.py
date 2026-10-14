"""Generate responsive hero previews. Run with Python + Pillow after changing covers."""
import json
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]
projects = ROOT / 'content/projects'
for slug in json.loads((projects / 'index.json').read_text(encoding='utf-8-sig')):
    path = projects / slug / 'info.json'
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    with Image.open(path.parent / data['hero']['file']) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
        folder = path.parent / 'previews'
        folder.mkdir(exist_ok=True)
        variants = []
        for width in sorted(set(min(w, image.width) for w in (400, 800, 1600, 2400))):
            height = max(1, round(image.height * width / image.width))
            filename = f'previews/hero-{width}.webp'
            image.resize((width, height), Image.Resampling.LANCZOS).save(path.parent / filename, quality=88, method=6)
            variants.append({'file': filename, 'width': width})
        data['hero']['previews'] = variants
        data['hero']['width'], data['hero']['height'] = image.size
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Generated responsive covers for all projects.')
