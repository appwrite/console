import { AppwriteException } from '@appwrite.io/console';

/** True when access is blocked until the console account email is verified. */
export function isVerifyEmailRedirectError(error: unknown): boolean {
    if (error instanceof AppwriteException) {
        return (
            error.type === 'user_email_not_verified' ||
            error.type === 'console_account_verification_required' ||
            (error.message?.includes('Console account verification is required') ?? false)
        );
    }

    if (error && typeof error === 'object' && 'message' in error) {
        const msg = (error as { message: unknown }).message;
        if (typeof msg !== 'string') return false;
        const typ =
            'type' in error && typeof (error as { type: unknown }).type === 'string'
                ? (error as { type: string }).type
                : undefined;
        return (
            typ === 'user_email_not_verified' ||
            typ === 'console_account_verification_required' ||
            msg.includes('Console account verification is required')
        );
    }

    return false;
}
