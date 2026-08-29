import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

function generateGymFlowPng(size: number, isMaskable = false): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Pixel data generation
  const rawRows: Buffer[] = [];
  const radius = isMaskable ? 0 : size * 0.2;
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const idx = 1 + x * 4;

      // Check rounded corner bounds for non-maskable icons
      let inBounds = true;
      if (!isMaskable) {
        const dx = Math.abs(x - center) - (center - radius);
        const dy = Math.abs(y - center) - (center - radius);
        if (dx > 0 && dy > 0) {
          if (Math.hypot(dx, dy) > radius) {
            inBounds = false;
          }
        }
      }

      if (!inBounds) {
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0; // transparent
        continue;
      }

      // Normalized coordinates [0, 1]
      const nx = x / size;
      const ny = y / size;

      // Base background: #09090b with subtle dark blue radial gradient
      const distFromCenter = Math.hypot(nx - 0.5, ny - 0.5);
      let r = 9 + Math.max(0, Math.floor((1 - distFromCenter) * 12));
      let g = 9 + Math.max(0, Math.floor((1 - distFromCenter) * 16));
      let b = 11 + Math.max(0, Math.floor((1 - distFromCenter) * 35));

      // Draw Dumbbell Shapes
      // Horizontal bar
      if (ny >= 0.46 && ny <= 0.54 && nx >= 0.28 && nx <= 0.72) {
        r = 244;
        g = 244;
        b = 245;
      }

      // Left inner weight plate
      if (nx >= 0.24 && nx <= 0.28 && ny >= 0.32 && ny <= 0.68) {
        // Gradient #3b82f6 -> #8b5cf6
        const t = (ny - 0.32) / 0.36;
        r = Math.floor(59 + t * (139 - 59));
        g = Math.floor(130 + t * (92 - 130));
        b = Math.floor(246 + t * (246 - 246));
      }

      // Left outer weight plate
      if (nx >= 0.16 && nx <= 0.23 && ny >= 0.25 && ny <= 0.75) {
        const t = (ny - 0.25) / 0.5;
        r = Math.floor(59 + t * (139 - 59));
        g = Math.floor(130 + t * (92 - 130));
        b = Math.floor(246 + t * (246 - 246));
      }

      // Right inner weight plate
      if (nx >= 0.72 && nx <= 0.76 && ny >= 0.32 && ny <= 0.68) {
        const t = (ny - 0.32) / 0.36;
        r = Math.floor(59 + t * (139 - 59));
        g = Math.floor(130 + t * (92 - 130));
        b = Math.floor(246 + t * (246 - 246));
      }

      // Right outer weight plate
      if (nx >= 0.77 && nx <= 0.84 && ny >= 0.25 && ny <= 0.75) {
        const t = (ny - 0.25) / 0.5;
        r = Math.floor(59 + t * (139 - 59));
        g = Math.floor(130 + t * (92 - 130));
        b = Math.floor(246 + t * (246 - 246));
      }

      // Lightning accent in center (#38bdf8)
      // Triangle 1: (0.42, 0.28) -> (0.58, 0.28) -> (0.48, 0.50)
      // Triangle 2: (0.48, 0.48) -> (0.62, 0.48) -> (0.38, 0.72)
      const inUpperBolt =
        ny >= 0.28 &&
        ny <= 0.50 &&
        nx >= 0.42 + (ny - 0.28) * 0.27 &&
        nx <= 0.58 - (ny - 0.28) * 0.45;
      const inLowerBolt =
        ny >= 0.48 &&
        ny <= 0.72 &&
        nx >= 0.38 + (0.72 - ny) * 0.41 &&
        nx <= 0.62 - (ny - 0.48) * 1.0;

      if (inUpperBolt || inLowerBolt) {
        r = 56;
        g = 189;
        b = 248;
      }

      row[idx] = Math.min(255, Math.max(0, r));
      row[idx + 1] = Math.min(255, Math.max(0, g));
      row[idx + 2] = Math.min(255, Math.max(0, b));
      row[idx + 3] = 255;
    }
    rawRows.push(row);
  }

  const rawBuffer = Buffer.concat(rawRows);
  const compressedData = zlib.deflateSync(rawBuffer, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 192x192
const png192 = generateGymFlowPng(192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

// Generate 512x512
const png512 = generateGymFlowPng(512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);

// Generate 512x512 maskable
const png512Maskable = generateGymFlowPng(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512-maskable.png'), png512Maskable);

console.log('✅ Generated PWA icons successfully in public/icons/:');
console.log(' - icon-192x192.png');
console.log(' - icon-512x512.png');
console.log(' - icon-512x512-maskable.png');
