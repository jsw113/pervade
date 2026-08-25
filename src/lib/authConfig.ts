export const AUTH_CONFIG = {
  naver: {
    clientId: process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "eXWsUTMyQs5043_PJBu5",
    clientSecret: process.env.NAVER_CLIENT_SECRET || "YfJgrUfC4O",
    redirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || "https://www.pervade.co.kr/api/auth/callback/naver",
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID || process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
    clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || "https://www.pervade.co.kr/api/auth/callback/kakao",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "https://www.pervade.co.kr/api/auth/callback/google",
  }
};
