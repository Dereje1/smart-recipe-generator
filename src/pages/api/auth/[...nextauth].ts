import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { clientPromise } from '../../../lib/mongodb';
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            profile: (profile) => {
                return {
                    id: profile.sub,
                    name: profile.name || 'Anonymous',
                    email: profile.email,
                    image: profile.picture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y', // Default image if not provided
                }
            }
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: undefined // If set, new users will be directed here on first sign in
    },
    callbacks: {
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token and user id from a provider.
            session.user.id = user.id;
            return session
        },
        async redirect({ url, baseUrl }) {
            // Always redirect to the index page after sign-in, unless the recipe detail page is requested
            if (url.includes('RecipeDetail')) return url
            return baseUrl; // this is equivalent to '/'
        }
    },

}

export default NextAuth(authOptions)