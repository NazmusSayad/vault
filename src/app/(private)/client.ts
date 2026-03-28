'use client'

import dynamic from 'next/dynamic'
import LoadingPage from '../loading'

export const PrivateLayoutClient = dynamic(
  () => import('@/components/private-layout').then((mod) => mod.PrivateLayout),
  { ssr: false, loading: LoadingPage }
)
