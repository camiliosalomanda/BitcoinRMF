import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      xId?: string;
      xUsername?: string;
      xName?: string;
      xProfileImage?: string;
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    xId?: string;
    xUsername?: string;
    xName?: string;
    xProfileImage?: string;
    isAdmin?: boolean;
  }
}
