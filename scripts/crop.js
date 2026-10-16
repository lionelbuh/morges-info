/** Largest crop of the given aspect ratio, centred on the focal point and kept inside the image. */
export function cropBox(width, height, { aspect, focusX, focusY }) {
  let w = width;
  let h = Math.round(width / aspect);
  if (h > height) {
    h = height;
    w = Math.round(height * aspect);
  }
  const left = Math.min(Math.max(Math.round(focusX * width - w / 2), 0), width - w);
  const top = Math.min(Math.max(Math.round(focusY * height - h / 2), 0), height - h);
  return { left, top, width: w, height: h };
}
