Use this for screenshots, UI mockups, diagrams, or any visual content: the model only sees images through this tool, never by reading a file.

Parameters:
- path (required): Path to image file (relative to cwd or absolute).

Notes:
- Raster formats only: png, jpg, gif, webp. A file over 15MB is rejected.
- svg is returned as text source instead, which works even with a text-only model.
- bmp is rejected: convert it to PNG first.
- Requires a model that accepts image input. Any other model gets an error; svg is the only exception.