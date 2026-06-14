"""Generate simple colored square PNG icons for the extension."""

# Minimal PNG files (solid blue squares)
# We'll create valid tiny PNGs using base64

import base64

# This is a minimal 16x16 blue PNG in base64
icon_16 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2NkYPj/n4EBBJgYqA"
    "swMjD8ZwRSzCAMBgYAcaQRMh7Y0+AAAAAASUVORK5CYII="
)

with open("icon16.png", "wb") as f:
    f.write(icon_16)
print("Created icon16.png")

# For 48 and 128, just copy the same for now
import shutil
shutil.copy("icon16.png", "icon48.png")
print("Created icon48.png")
shutil.copy("icon16.png", "icon128.png")
print("Created icon128.png")
print("\nIcons created! (Placeholder — replace with real icons later)")