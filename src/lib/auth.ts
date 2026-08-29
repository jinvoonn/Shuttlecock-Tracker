import { headers, cookies } from 'next/headers';
import { ADMIN_SECRET, VIEWER_SESSION_COOKIE, ViewerPermission } from './constants';
import { verifyToken } from './actions/viewerPin';

/**
 * Checks whether the current user is an admin by checking explicit mode parameter first,
 * then falling back to the referer header.
 */
export async function getUserRole(explicitMode?: string): Promise<'admin' | 'viewer'> {
    if (explicitMode && explicitMode === ADMIN_SECRET) {
        return 'admin';
    }

    try {
        const headersList = await headers();
        const referer = headersList.get('referer') || '';
        
        if (referer.includes(`/${ADMIN_SECRET}`)) {
            return 'admin';
        }
    } catch {
        // In non-request contexts, fallback gracefully
    }
    
    return 'viewer';
}

/**
 * Asserts that the caller has admin permissions. Throws an error if unauthorized.
 */
export async function assertAdmin(explicitMode?: string, actionName: string = "action"): Promise<void> {
    const role = await getUserRole(explicitMode);
    if (role !== 'admin') {
        throw new Error(`Unauthorized: Admin access required to perform ${actionName}.`);
    }
}

/**
 * Asserts that the caller is either an Admin OR an Unlocked Viewer with the specified permission.
 * Throws an error if unauthorized.
 */
export async function assertAdminOrViewerPermission(
    permission: ViewerPermission,
    explicitMode?: string,
    actionName: string = "action"
): Promise<void> {
    const role = await getUserRole(explicitMode);
    if (role === 'admin') {
        return; // Full admin access bypasses viewer permissions
    }

    // Check Viewer Unlock State from Cookie
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(VIEWER_SESSION_COOKIE)?.value;
        const { valid, permissions } = await verifyToken(token);

        if (!valid) {
            throw new Error(`Unauthorized: Your unlock session has expired or is invalid. Please enter the Viewer PIN again.`);
        }

        if (!permissions.includes(permission)) {
            throw new Error(`Unauthorized: You don't have permission to perform ${actionName}.`);
        }
    } catch (err: unknown) {
        const e = err as Error;
        if (e.message.startsWith("Unauthorized:")) {
            throw e;
        }
        throw new Error(`Unauthorized: You don't have permission to perform ${actionName}.`);
    }
}

