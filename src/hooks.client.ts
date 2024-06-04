import { AppwriteException } from '@appwrite.io/console';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error, message, status }) => {
    if (error instanceof AppwriteException) {
        status = error.code === 0 ? undefined : error.code;
        message = error.message;
    }

    return {
        message,
        status
    };
};
