import type { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

async function serverLoginApi(data: {
  provider: string;
  providerId: string;
  email: string;
  nickname: string;
  profileImg?: string;
}) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend login failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<{ token: string; userId: number; nickname: string }>;
}

// 네이버 커스텀 프로바이더
function NaverProvider() {
  return {
    id: "naver",
    name: "Naver",
    type: "oauth" as const,
    authorization: {
      url: "https://nid.naver.com/oauth2.0/authorize",
      params: { response_type: "code" },
    },
    token: "https://nid.naver.com/oauth2.0/token",
    userinfo: "https://openapi.naver.com/v1/nid/me",
    clientId: process.env.NAVER_CLIENT_ID!,
    clientSecret: process.env.NAVER_CLIENT_SECRET!,
    profile(profile: any) {
      const res = profile.response;
      return {
        id: res.id,
        name: res.nickname || res.name,
        email: res.email,
        image: res.profile_image,
      };
    },
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    NaverProvider(),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // 최초 로그인: 소셜 정보 저장 + 백엔드 JWT 발급
        token.provider = account.provider;
        token.providerId = account.providerAccountId;

        const naverRes = (profile as any).response;
        const socialName = naverRes?.nickname || naverRes?.name || (profile as any).nickname || (profile as any).name || token.name || "유저";
        token.nickname = socialName;
        token.profileImg = naverRes?.profile_image || (profile as any).picture || (profile as any).thumbnail_image_url || (profile as any).image;
        token.socialEmail = naverRes?.email || (profile as any).email || token.email || "";

        try {
          const res = await serverLoginApi({
            provider: account.provider.toUpperCase(),
            providerId: account.providerAccountId,
            email: token.socialEmail as string,
            nickname: socialName,
            profileImg: token.profileImg as string | undefined,
          });
          token.accessToken = res.token;
          token.backendUserId = res.userId;
          token.nickname = res.nickname;
          token.tokenIssuedAt = Date.now();
        } catch (e) {
          console.error("Backend login failed:", e);
        }
      }

      // 토큰 만료 체크 (50분 경과 시 갱신, 만료는 1시간)
      const issuedAt = (token.tokenIssuedAt as number) || 0;
      const fiftyMinutes = 50 * 60 * 1000;
      if (token.accessToken && Date.now() - issuedAt > fiftyMinutes) {
        try {
          const res = await serverLoginApi({
            provider: (token.provider as string || "").toUpperCase(),
            providerId: token.providerId as string || "",
            email: token.socialEmail as string || "",
            nickname: token.nickname as string || "유저",
            profileImg: token.profileImg as string | undefined,
          });
          token.accessToken = res.token;
          token.backendUserId = res.userId;
          token.tokenIssuedAt = Date.now();
        } catch (e) {
          console.error("Token refresh failed:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).backendUserId = token.backendUserId;
      (session as any).provider = token.provider;
      (session as any).providerId = token.providerId;
      if (session.user) {
        session.user.name = (token.nickname as string) || session.user.name || "유저";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
