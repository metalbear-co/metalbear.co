# MetalBear Website — Claude Notes

## Generating Blog Thumbnail Images

Use the **Gemini Flash image generation API** directly via curl/Python.

**Model:** `gemini-3.1-flash-image-preview`
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`
**API key env var:** `GEMINI_API_KEY`

### Python snippet

```python
import json, os, base64, subprocess
from PIL import Image
import io

def generate_image(prompt, out_path):
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
    })
    result = subprocess.run([
        "curl", "-s", "-X", "POST",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
        "-H", f"x-goog-api-key: {os.environ['GEMINI_API_KEY']}",
        "-H", "Content-Type: application/json",
        "-d", payload
    ], capture_output=True, text=True)
    r = json.loads(result.stdout)
    parts = r["candidates"][0]["content"]["parts"]
    for p in parts:
        if "inlineData" in p:
            img = Image.open(io.BytesIO(base64.b64decode(p["inlineData"]["data"]))).convert("RGB")
            img = img.resize((1200, 630), Image.LANCZOS)
            img.save(out_path, "PNG")
            return True
    return False
```

### Blog thumbnail conventions
- **Blog card image:** `blog-thumbnail.*` in the post folder (takes priority over social thumbnail)
- **Social/OG image:** `thumbnail.*` in the post folder (referenced in front matter `images: [thumbnail.png]`)
- **Fallback:** `/static/blog-thumbnail-placeholder.png`
- Fallback chain in template: `blog-thumbnail*` → `thumbnail*` → placeholder

### Generating a thumbnail for a new blog post

1. Read the post's `title` and `lead`/`description` from its `index.md`.
2. Check if the title contains a **city or country** — if so, make that place the primary visual anchor.
3. Write a prompt using the prefix below, then describe the scene (objects only, no characters):

```
Rubberhose cartoon illustration, 1930s animation style, flat colors, bold black outlines,
wide 16:9 landscape, absolutely NO TEXT, NO characters, NO people, NO animals, NO robots.
Brand colors: background #FAFAFD, purple #756DF3, yellow #FFCB7D, dark purple #232141,
blush red #F36869. Bold black outlines throughout.

Scene: <your concept here>
```

4. Run `generate_image(prompt, "content/en/blog/<slug>/blog-thumbnail.png")`.
5. Commit the new file: `git add content/en/blog/<slug>/blog-thumbnail.png && git commit`.

### Art direction for blog thumbnails
- Size: **1200x630**
- Style: **rubberhose** — 1930s cartoon, noodle limbs, flat colors, bold black outlines
- No text in images
- Brand palette: `#FAFAFD` bg, `#756DF3` purple, `#FFCB7D` yellow, `#232141` dark purple, `#F36869` blush red
- If title contains a city/country → use that place as primary visual anchor
