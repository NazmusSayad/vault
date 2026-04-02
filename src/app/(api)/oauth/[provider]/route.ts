import { randomUUID } from 'node:crypto'

import { serverEnv } from '@/env.server'
import {
  getDefaultNameFromEmail,
  normalizeEmail,
} from '@/server/auth/auth-helpers'
import { createAuthenticationSuccessResponse } from '@/server/auth/session'
import { OAUTH_STATE_COOKIE_NAME, SECURE_COOKIES } from '@/server/constants'
import { prisma } from '@/server/db'
import { NextRequest, NextResponse } from 'next/server'

type OAuthProvider = 'github' | 'google'

type OAuthProfile = {
  avatarUrl: string | null
  email: string
  name: string | null
  providerAccountId: string
}

function parseProvider(value: string): OAuthProvider | null {
  if (value === 'github' || value === 'google') {
    return value
  }

  return null
}

function getAuthorizeUrl(provider: OAuthProvider, state: string) {
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: serverEnv.OAUTH_GOOGLE_CLIENT_ID,
      redirect_uri: `${serverEnv.APP_URL}/oauth/google`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const params = new URLSearchParams({
    client_id: serverEnv.OAUTH_GITHUB_CLIENT_ID,
    redirect_uri: `${serverEnv.APP_URL}/oauth/github`,
    scope: 'read:user user:email',
    state,
  })

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

function createAuthRedirect(request: NextRequest, message: string) {
  const response = NextResponse.redirect(
    new URL(`/auth/login?error=${encodeURIComponent(message)}`, request.url)
  )

  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: SECURE_COOKIES,
  })

  return response
}

async function exchangeGoogleCodeForProfile(
  code: string
): Promise<OAuthProfile> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      client_id: serverEnv.OAUTH_GOOGLE_CLIENT_ID,
      client_secret: serverEnv.OAUTH_GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${serverEnv.APP_URL}/oauth/google`,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!tokenResponse.ok) {
    throw new Error('Google token exchange failed.')
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string
  }

  if (!tokenData.access_token) {
    throw new Error('Google did not return an access token.')
  }

  const profileResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  )

  if (!profileResponse.ok) {
    throw new Error('Could not load your Google profile.')
  }

  const profile = (await profileResponse.json()) as {
    email?: string
    id?: string
    name?: string
    picture?: string
    verified_email?: boolean
  }

  if (!profile.email || !profile.verified_email || !profile.id) {
    throw new Error('Google did not return a verified email address.')
  }

  return {
    avatarUrl: profile.picture?.trim() || null,
    email: profile.email,
    name: profile.name?.trim() || null,
    providerAccountId: profile.id,
  }
}

async function exchangeGithubCodeForProfile(
  code: string
): Promise<OAuthProfile> {
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      body: new URLSearchParams({
        client_id: serverEnv.OAUTH_GITHUB_CLIENT_ID,
        client_secret: serverEnv.OAUTH_GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${serverEnv.APP_URL}/oauth/github`,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    }
  )

  if (!tokenResponse.ok) {
    throw new Error('GitHub token exchange failed.')
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string
  }

  if (!tokenData.access_token) {
    throw new Error('GitHub did not return an access token.')
  }

  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${tokenData.access_token}`,
    'User-Agent': 'keyvoid',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const profileResponse = await fetch('https://api.github.com/user', {
    headers: githubHeaders,
  })

  if (!profileResponse.ok) {
    throw new Error('Could not load your GitHub profile.')
  }

  const profile = (await profileResponse.json()) as {
    avatar_url?: string
    id?: number
    name?: string
  }

  if (!profile.id) {
    throw new Error('GitHub did not return an account id.')
  }

  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: githubHeaders,
  })

  if (!emailResponse.ok) {
    throw new Error('Could not load your GitHub email address.')
  }

  const emailList = (await emailResponse.json()) as Array<{
    email: string
    primary: boolean
    verified: boolean
  }>
  const verifiedPrimaryEmail = emailList.find(
    (email) => email.primary && email.verified
  )
  const verifiedEmail = emailList.find((email) => email.verified)
  const email = verifiedPrimaryEmail?.email || verifiedEmail?.email

  if (!email) {
    throw new Error('GitHub did not return a verified email address.')
  }

  return {
    avatarUrl: profile.avatar_url?.trim() || null,
    email,
    name: profile.name?.trim() || null,
    providerAccountId: String(profile.id),
  }
}

async function getOAuthProfile(provider: OAuthProvider, code: string) {
  if (provider === 'google') {
    return exchangeGoogleCodeForProfile(code)
  }

  return exchangeGithubCodeForProfile(code)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await context.params
  const provider = parseProvider(rawProvider)

  if (!provider) {
    return createAuthRedirect(request, 'Unsupported OAuth provider.')
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error || errorDescription) {
    return createAuthRedirect(
      request,
      errorDescription ?? 'The OAuth provider returned an authentication error.'
    )
  }

  if (!code) {
    const state = randomUUID()
    const response = NextResponse.redirect(getAuthorizeUrl(provider, state))

    response.cookies.set({
      name: OAUTH_STATE_COOKIE_NAME,
      value: `${provider}:${state}`,
      httpOnly: true,
      maxAge: 60 * 10,
      path: '/',
      sameSite: 'lax',
      secure: SECURE_COOKIES,
    })

    return response
  }

  const state = url.searchParams.get('state')
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value

  if (!state || expectedState !== `${provider}:${state}`) {
    return createAuthRedirect(request, 'Invalid OAuth state. Please try again.')
  }

  try {
    const oauthProfile = await getOAuthProfile(provider, code)
    const email = normalizeEmail(oauthProfile.email)

    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          avatarUrl: oauthProfile.avatarUrl,
          email,
          name: oauthProfile.name || getDefaultNameFromEmail(email),
          password: null,
        },
      })
    } else if (!user.avatarUrl && oauthProfile.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: oauthProfile.avatarUrl,
        },
      })
    }

    const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: oauthProfile.providerAccountId,
        },
      },
    })

    if (existingOAuthAccount && existingOAuthAccount.userId !== user.id) {
      return createAuthRedirect(
        request,
        'This social account is already connected to another user.'
      )
    }

    if (!existingOAuthAccount) {
      await prisma.oAuthAccount.create({
        data: {
          provider,
          providerAccountId: oauthProfile.providerAccountId,
          userId: user.id,
        },
      })
    }

    const response = await createAuthenticationSuccessResponse(
      { id: user.id },
      { returnTo: '/' }
    )

    response.cookies.set({
      name: OAUTH_STATE_COOKIE_NAME,
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: SECURE_COOKIES,
    })

    return response
  } catch (error) {
    return createAuthRedirect(
      request,
      error instanceof Error
        ? error.message
        : 'Could not sign you in with this OAuth provider.'
    )
  }
}
