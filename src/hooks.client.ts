import { AppwriteException } from '@appwrite.io/console';
import type { HandleClientError } from '@sveltejs/kit';
import { setupSentry } from '$lib/sentry';

setupSentry({
    withSessionReplay: true
});

export const handleError: HandleClientError = ({ error, message, status }) => {
    console.error(error);

    let type: string;
    if (error instanceof AppwriteException) {
        status = error.code === 0 ? undefined : error.code;
        message = error.message;
        type = error.type;
    }

    return {
        message,
        status,
        type
    };
};
