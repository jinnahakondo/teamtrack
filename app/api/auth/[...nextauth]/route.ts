import { connectDb } from "@/lib/db/dbConnection";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // db connection 
                await connectDb()

                // find user 
                const user = await User.findOne({ email: credentials?.email }).select("+password")
                if (!user) {
                    throw new Error("Invalid credentials")
                }

                // compare password
                const isPasswordMatched =
                    await bcrypt.compare(credentials.password, user.password)

                if (!isPasswordMatched) {
                    throw new Error("Invalid credentials")
                }



                // success login
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                }

            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
            return baseUrl
        },
        // Pass user details to the token
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        // Pass token details to the session so it can be accessed in components
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };