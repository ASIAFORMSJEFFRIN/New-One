# 3D Models Folder

Place your dish 3D model folders here.

## Structure for each dish:

```
models/
  dish-name/
    model.glb     ← 3D model (required for Android/WebXR)
    model.usdz    ← 3D model (optional, for iPhone Quick Look)
    poster.jpg    ← Preview image shown while 3D loads
```

## How to get 3D models

- Sketchfab: https://sketchfab.com (filter: free + downloadable)
- Export as .glb format
- Optional: convert .glb to .usdz using Apple's Reality Converter (free, Mac only)

## Tips

- Keep .glb files under 5MB for good mobile performance
- poster.jpg should be 800×800px max
- After uploading, update menu.json with the correct path

See README.md at the project root for full instructions.
