// regenerate PNG icons from public/icon.svg: node scripts/make-icons.mjs
import sharp from 'sharp'

const sizes = { 'pwa-192.png': 192, 'pwa-512.png': 512, 'apple-touch-icon.png': 180 }
for (const [name, size] of Object.entries(sizes)) {
  await sharp('public/icon.svg', { density: 300 }).resize(size, size).png().toFile(`public/${name}`)
}
