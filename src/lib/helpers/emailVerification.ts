import { AppwriteException, type Models } from '@appwrite.io/console';

const EMAIL_VERIFICATION_REQUIRED_ERROR_TYPE = 'user_email_not_verified';
const CONSOLE_ACCOUNT_VERIFICATION_REQUIRED_TYPE = 'console_account_verification_required';

export function isEmailVerificationEnabled(
    consoleVariables: Models.ConsoleVariables | undefined
): boolean {
    if (!consoleVariables) {
        return false;
    }

    return String(consoleVariables._APP_CONSOLE_EMAIL_VERIFICATION) === 'true';
}

export function isEmailVerificationRequiredError(type: string | undefined): boolean {
    return type === EMAIL_VERIFICATION_REQUIRED_ERROR_TYPE;
}

function matchesVerifyEmailGate(type: string | undefined, message: string | undefined): boolean {
    if (isEmailVerificationRequiredError(type)) return true;
    if (type === CONSOLE_ACCOUNT_VERIFICATION_REQUIRED_TYPE) return true;
    if (message?.includes('Console account verification is required')) return true;
    return false;
}

/**
 * Console APIs may return `user_email_not_verified`, `console_account_verification_required`,
 * or a message-only error when email verification is enforced for the console account.
 */
export function isVerifyEmailRedirectError(error: unknown): boolean {
    if (error instanceof AppwriteException) {
        return matchesVerifyEmailGate(error.type, error.message);
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const msg = (error as { message: unknown }).message;
        if (typeof msg !== 'string') return false;
        const typ =
            'type' in error && typeof (error as { type: unknown }).type === 'string'
                ? (error as { type: string }).type
                : undefined;
        return matchesVerifyEmailGate(typ, msg);
    }
    return false;
}
