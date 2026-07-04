/**
 * Fügt mehrere Screenshots zu einem Kontaktabzug (Raster) zusammen — zum
 * schnellen visuellen Prüfen. Nutzt sharp.
 * Start: node scripts/montage.mjs <outfile.png> <img1> <img2> ...
 */
import sharp from "sharp";

const [out, ...imgs] = process.argv.slice(2);
if (!out || imgs.length === 0) { console.error("Usage: node scripts/montage.mjs out.png img...").valueOf; process.exit(1); }

const CELL_W = 420, CELL_H = 280, PAD = 8, COLS = 2;
const rows = Math.ceil(imgs.length / COLS);
const W = COLS * CELL_W + (COLS + 1) * PAD;
const H = rows * CELL_H + (rows + 1) * PAD;

const cells = [];
for (let i = 0; i < imgs.length; i++) {
  const col = i % COLS, row = Math.floor(i / COLS);
  const buf = await sharp(imgs[i]).resize(CELL_W, CELL_H, { fit: "contain", background: "#0b0b13" }).toBuffer();
  cells.push({ input: buf, left: PAD + col * (CELL_W + PAD), top: PAD + row * (CELL_H + PAD) });
}
await sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
  .composite(cells).png().toFile(out);
console.log("Montage:", out, `(${imgs.length} Bilder, ${COLS}×${rows})`);
