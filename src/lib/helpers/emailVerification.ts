import type { Models } from '@appwrite.io/console';

const EMAIL_VERIFICATION_REQUIRED_ERROR_TYPE = 'user_email_not_verified';

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
