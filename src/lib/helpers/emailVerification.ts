import type { Models } from '@appwrite.io/console';

export function isEmailVerificationEnabled(
    consoleVariables: Models.ConsoleVariables | undefined
): boolean {
    if (!consoleVariables) {
        return false;
    }

    return String(consoleVariables._APP_CONSOLE_EMAIL_VERIFICATION) === 'true';
}
