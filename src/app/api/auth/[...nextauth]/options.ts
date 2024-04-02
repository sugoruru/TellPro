import GoogleProvider from 'next-auth/providers/google';
import { AuthOptions } from 'next-auth';

const OPTIONS: AuthOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account, profile, isNewUser }) => {
      if (user) {
        token.user = user;
        const u = user as any;
        token.role = u.role;
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token;
    },
    session: ({ session, token }) => {
      token.accessToken
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    }
  },
  pages: {
    error: "/auth/error"
  }
};

export default OPTIONS;