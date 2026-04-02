import { Logo } from '@/components/brand/logo'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'

const sizes = [16, 32, 64, 128, 192, 256, 512]
const outputDir = path.resolve(process.cwd(), 'public/logo')

const whiteSvg = renderToStaticMarkup(
  <Logo width="1024" height="1024" secondary="#ffffff" />
)
const darkSvg = renderToStaticMarkup(
  <Logo width="1024" height="1024" secondary="#000000" />
)

async function main() {
  await mkdir(outputDir, { recursive: true })

  await Promise.all(
    sizes.map(async (size) => {
      await Promise.all([
        sharp(Buffer.from(whiteSvg))
          .resize(size, size)
          .png()
          .toFile(path.join(outputDir, `white-${size}.png`)),

        sharp(Buffer.from(whiteSvg))
          .resize(size, size)
          .webp()
          .toFile(path.join(outputDir, `white-${size}.webp`)),

        sharp(Buffer.from(darkSvg))
          .resize(size, size)
          .png()
          .toFile(path.join(outputDir, `black-${size}.png`)),

        sharp(Buffer.from(darkSvg))
          .resize(size, size)
          .webp()
          .toFile(path.join(outputDir, `black-${size}.webp`)),
      ])
    })
  )
}

void main()
