import { ImageResponse } from 'next/og'

import { Logo } from '@/components/brand/logo'

export const size = {
  width: 128,
  height: 128,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <Logo
      style={{
        width: size.width,
        height: size.height,
      }}
    />,
    size
  )
}
