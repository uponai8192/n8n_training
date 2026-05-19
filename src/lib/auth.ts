import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        magicToken: { label: "Magic Token", type: "text" },
      },
      async authorize(credentials) {
        // Magic link token login (partners)
        if (credentials?.magicToken) {
          const link = await prisma.magicLink.findUnique({
            where: { token: credentials.magicToken },
          });
          if (!link || link.used || link.expiresAt < new Date()) return null;

          const user = await prisma.user.findUnique({
            where: { email: link.email },
          });
          if (!user) return null;

          await prisma.magicLink.update({
            where: { id: link.id },
            data: { used: true },
          });

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        // Email + password login (admin)
        if (credentials?.email && credentials?.password) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
