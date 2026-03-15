import { headers } from 'next/headers';
import { ADMIN_SECRET } from './constants';

export async function getUserRole(): Promise<'admin' | 'viewer'> {
    const headersList = await headers();
    const referer = headersList.get('referer') || '';
    
    if (referer.includes(`/${ADMIN_SECRET}`)) {
        return 'admin';
    }
    
    return 'viewer';
}
