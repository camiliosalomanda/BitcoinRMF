import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ADMIN_X_IDS = (process.env.ADMIN_X_IDS || '').split(',').filter(Boolean);

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.xId) return null;
  return {
    xId: session.user.xId,
    xUsername: session.user.xUsername || '',
    xName: session.user.xName || session.user.name || '',
    isAdmin: ADMIN_X_IDS.includes(session.user.xId),
  };
}

export async function getUserRole() {
  const user = await getSessionUser();
  if (!user) return 'anonymous';
  return user.isAdmin ? 'admin' : 'user';
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.isAdmin ?? false;
}
