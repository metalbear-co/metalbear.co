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

### Art direction for blog thumbnails
- Size: **1200x630**
- Style: **rubberhose** — 1930s cartoon, noodle limbs, flat colors, bold black outlines
- No text in images
- Brand palette: `#FAFAFD` bg, `#756DF3` purple, `#FFCB7D` yellow, `#232141` dark purple, `#F36869` blush red
- If title contains a city/country → use that place as primary visual anchor
