import { signInErrorHref } from '@/common/href'
import { completeSignInAction } from '@/data/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    // const { email, secret, return_to } = await searchParams
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email') ?? undefined
    const secret = searchParams.get('secret') ?? undefined
    const return_to = searchParams.get('return_to') ?? '/'

    // If missing parameters, show error
    if (!email || !secret) {
        return NextResponse.redirect(new URL(signInErrorHref({
            error: 'Missing email or secret parameter',
            returnTo: return_to,
        }), request.url))
    }

    try {
        const result = await completeSignInAction({ email, secret })

        if (result.success) {
            // Successful sign-in, redirect to return_to
            return NextResponse.redirect(new URL(return_to, request.url))
        } else {
            // Failed sign-in, show error
            return NextResponse.redirect(new URL(signInErrorHref({
                error: result.reason,
                returnTo: return_to,
            }), request.url))
        }
    } catch (err) {
        console.error('Sign-in page error:', err)
        return NextResponse.redirect(new URL(signInErrorHref({
            error: 'An unexpected error occurred',
            returnTo: return_to,
        }), request.url))
    }
}