import type { ComponentProps } from 'react'

export function Logo({ ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 122.88 122.88"
      xmlns="http://www.w3.org/2000/svg"
      height="1em"
      width="1em"
      {...props}
    >
      <path
        fill="#498854"
        fillRule="evenodd"
        d="m20.62,47.51l81.64,0a6,6 0 0 1 6,6l0,63.38a6,6 0 0 1 -6,6l-81.64,0a6,6 0 0 1 -6,-6l0,-63.39a6,6 0 0 1 6,-6l0,0.01z"
      />

      <path
        fill="#fff"
        fillRule="evenodd"
        className="fill-[black] dark:fill-[white]"
        d="m56.90645,89.26l-6.47,16.95l22.79,0l-6,-17.21a11.79,11.79 0 1 0 -10.32,0.24l0,0.02z"
      />

      <path
        fill="#fff"
        fillRule="evenodd"
        className="fill-[black] dark:fill-[white]"
        d="m98.19498,47.51l-11.35,0l0,-9.42a27.32,27.32 0 0 0 -7.54,-19a24.4,24.4 0 0 0 -35.73,0a27.32,27.32 0 0 0 -7.54,19l0,9.42l-11.35,0l0,-9.42a38.73,38.73 0 0 1 10.72,-26.81a35.69,35.69 0 0 1 52.07,0a38.67,38.67 0 0 1 10.72,26.81l0,9.42z"
      />
    </svg>
  )
}
