import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import { MessagingProviderType, type Models } from '@appwrite.io/console';

export function getProviderText(type: MessagingProviderType | Models.Provider['type']): string {
    switch (type) {
        case MessagingProviderType.Email:
            return 'Email';
        case MessagingProviderType.Sms:
            return 'SMS';
        case MessagingProviderType.Push:
            return 'Push';
        default:
            return '';
    }
}

/** Stores active polling intervals for messages. */
const messageIntervals = new Map<string, ReturnType<typeof setInterval>>();

/** Checks the status of a message and stops polling if it's no longer processing. */
function checkMessageStatus(message: Models.Message) {
    sdk.forProject(page.params.region, page.params.project)
        .messaging.getMessage(message.$id)
        .then((msg) => {
            if (msg.status !== 'processing') {
                clearPolling(message.$id);
                message.status = msg.status;
            }
        })
        .catch(() => clearPolling(message.$id));
}

/** Clears polling for a specific message. */
function clearPolling(messageId: string) {
    const intervalID = messageIntervals.get(messageId);
    if (intervalID) {
        clearInterval(intervalID);
        messageIntervals.delete(messageId);
    }
}

/** Stops polling for all messages. */
export function stopPolling() {
    messageIntervals.forEach((_, messageId) => clearPolling(messageId));
}

/** Starts polling message statuses. */
export function pollMessagesStatus(messages: Models.Message[]) {
    messages.forEach((message) => {
        clearPolling(message.$id);
        checkMessageStatus(message);

        const intervalID = setInterval(() => checkMessageStatus(message), 2000);
        messageIntervals.set(message.$id, intervalID);
    });
}
