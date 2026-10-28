import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatChunks = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * bpp;
  const pixels = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const rIn = y * (stride + 1) + 1;
    const rOut = y * stride;
    const pOut = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const rb = raw[rIn + x];
      const a = x >= bpp ? pixels[rOut + x - bpp] : 0;
      const b = y > 0 ? pixels[pOut + x] : 0;
      const c = x >= bpp && y > 0 ? pixels[pOut + x - bpp] : 0;
      pixels[rOut + x] =
        (f === 1
          ? rb + a
          : f === 2
            ? rb + b
            : f === 3
              ? rb + ((a + b) >> 1)
              : f === 4
                ? rb + paeth(a, b, c)
                : rb) & 255;
    }
  }
  return { width, height, bpp, pixels };
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function cropAndEncodePng(src, x0, y0, w, h) {
  const clampX = Math.max(0, Math.min(src.width - 1, Math.round(x0)));
  const clampY = Math.max(0, Math.min(src.height - 1, Math.round(y0)));
  const cw = Math.min(Math.round(w), src.width - clampX);
  const ch = Math.min(Math.round(h), src.height - clampY);

  const outBpp = 3;
  const raw = Buffer.alloc(ch * (cw * outBpp + 1));
  for (let y = 0; y < ch; y++) {
    const rowStart = y * (cw * outBpp + 1);
    raw[rowStart] = 0; // Filter type 0 (None)
    const srcY = clampY + y;
    for (let x = 0; x < cw; x++) {
      const srcIdx = (srcY * src.width + (clampX + x)) * src.bpp;
      const dstIdx = rowStart + 1 + x * outBpp;
      raw[dstIdx] = src.pixels[srcIdx];
      raw[dstIdx + 1] = src.pixels[srcIdx + 1];
      raw[dstIdx + 2] = src.pixels[srcIdx + 2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cw, 0);
  ihdr.writeUInt32BE(ch, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 6 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const outDir = path.resolve('web/assets/keke-pack');
fs.mkdirSync(outDir, { recursive: true });

const p1 = decodePng('public/assets/aistudio/___________0cf0a26f.png');
const p2 = decodePng('public/assets/aistudio/______________decbf300.png');

// 1. 5 Mood Circular Illustrations from p1 (2032x774)
const p1Moods = [
  { name: 'mood-normal.png', x: 67, y: 197, w: 288, h: 288 },
  { name: 'mood-cheer.png', x: 485, y: 197, w: 288, h: 288 },
  { name: 'mood-curious.png', x: 912, y: 197, w: 288, h: 288 },
  { name: 'mood-shy.png', x: 1322, y: 197, w: 288, h: 288 },
  { name: 'mood-night.png', x: 1713, y: 197, w: 288, h: 288 }
];

for (const item of p1Moods) {
  fs.writeFileSync(path.join(outDir, item.name), cropAndEncodePng(p1, item.x, item.y, item.w, item.h));
}

// 2. Slices from p2 (1312x1199)
const p2Slices = [
  // Top-Left Hero Banner
  { name: 'hero-main.png', x: 0, y: 0, w: 480, h: 386 },

  // 6 Avatars (头像 & 立绘) - circular portraits above caption
  { name: 'avatar-default.png', x: 507, y: 68, w: 116, h: 116 },
  { name: 'avatar-smile.png', x: 635, y: 68, w: 116, h: 116 },
  { name: 'avatar-wink.png', x: 762, y: 68, w: 116, h: 116 },
  { name: 'avatar-happy.png', x: 507, y: 227, w: 116, h: 116 },
  { name: 'avatar-curious.png', x: 635, y: 227, w: 116, h: 116 },
  { name: 'avatar-shy.png', x: 762, y: 227, w: 116, h: 116 },

  // 6 Full-body Chibis (Q版小人) - above caption
  { name: 'chibi-stand.png', x: 914, y: 65, w: 116, h: 128 },
  { name: 'chibi-happy.png', x: 1044, y: 65, w: 116, h: 128 },
  { name: 'chibi-wave.png', x: 1175, y: 65, w: 120, h: 128 },
  { name: 'chibi-sit.png', x: 914, y: 232, w: 116, h: 126 },
  { name: 'chibi-think.png', x: 1044, y: 232, w: 118, h: 126 },
  { name: 'chibi-sleep.png', x: 1175, y: 232, w: 120, h: 126 },

  // 8 Reaction Emotes (表情包) - square art above text
  { name: 'emote-yay.png', x: 26, y: 447, w: 104, h: 106 },
  { name: 'emote-hmph.png', x: 143, y: 447, w: 104, h: 106 },
  { name: 'emote-speechless.png', x: 259, y: 447, w: 104, h: 106 },
  { name: 'emote-shock.png', x: 375, y: 447, w: 104, h: 106 },
  { name: 'emote-angry.png', x: 26, y: 597, w: 104, h: 106 },
  { name: 'emote-shy.png', x: 143, y: 597, w: 104, h: 106 },
  { name: 'emote-sleepy.png', x: 259, y: 597, w: 104, h: 106 },
  { name: 'emote-drowsy.png', x: 375, y: 597, w: 104, h: 106 },

  // 6 Interactive Stickers (贴纸 / 角色互动) - includes curved hand-lettered caption
  { name: 'sticker-cheer.png', x: 26, y: 814, w: 134, h: 134 },
  { name: 'sticker-thanks.png', x: 182, y: 814, w: 136, h: 134 },
  { name: 'sticker-pat.png', x: 338, y: 814, w: 134, h: 134 },
  { name: 'sticker-watch.png', x: 26, y: 982, w: 134, h: 142 },
  { name: 'sticker-ok.png', x: 182, y: 982, w: 134, h: 142 },
  { name: 'sticker-goodnight.png', x: 338, y: 982, w: 136, h: 142 },

  // 6 Dynamic Half-body Poses (动态立绘 / 角色动作) - above caption
  { name: 'pose-cat.png', x: 516, y: 444, w: 160, h: 172 },
  { name: 'pose-think.png', x: 682, y: 444, w: 156, h: 172 },
  { name: 'pose-smile.png', x: 848, y: 444, w: 162, h: 172 },
  { name: 'pose-read.png', x: 508, y: 658, w: 168, h: 170 },
  { name: 'pose-work.png', x: 682, y: 658, w: 162, h: 170 },
  { name: 'pose-heart.png', x: 848, y: 658, w: 164, h: 170 },

  // Props & Decor (物品 & 道具 + 装饰元素)
  { name: 'prop-tablet.png', x: 1056, y: 452, w: 112, h: 108 },
  { name: 'prop-cat.png', x: 1188, y: 450, w: 102, h: 110 },
  { name: 'prop-books-coffee.png', x: 1052, y: 558, w: 122, h: 124 },
  { name: 'prop-bag.png', x: 1188, y: 558, w: 106, h: 128 },
  { name: 'deco-clapper.png', x: 920, y: 1032, w: 98, h: 118 },
  { name: 'deco-quote.png', x: 1032, y: 1040, w: 168, h: 110 },
  { name: 'deco-cat-badge.png', x: 1214, y: 1066, w: 68, h: 82 }
];

for (const item of p2Slices) {
  fs.writeFileSync(path.join(outDir, item.name), cropAndEncodePng(p2, item.x, item.y, item.w, item.h));
}

console.log(`Cropped ${p1Moods.length + p2Slices.length} assets into ${outDir}`);
