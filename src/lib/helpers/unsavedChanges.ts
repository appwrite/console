import { beforeNavigate, goto } from '$app/navigation';
import type { BeforeNavigate } from '@sveltejs/kit';

type UnsavedChangesGuardOptions = {
    message?: string;
    hasUnsavedChanges: () => boolean;
    onConfirmNavigate?: () => void;
    shouldBlockNavigation?: (navigation: BeforeNavigate) => boolean;
    onShowConfirmModal?: (url: string, onConfirm: () => void | Promise<void>) => void;
};

export const setupUnsavedChangesGuard = ({
    message,
    hasUnsavedChanges,
    onConfirmNavigate,
    shouldBlockNavigation,
    onShowConfirmModal
}: UnsavedChangesGuardOptions) => {
    message = message ?? 'You have unsaved changes. Are you sure you want to leave?';

    const beforeUnload = (event: BeforeUnloadEvent) => {
        if (!hasUnsavedChanges()) return;
        event.preventDefault();
        event.returnValue = message;
        return message;
    };

    beforeNavigate((navigation: BeforeNavigate) => {
        if (!hasUnsavedChanges()) return;
        if (shouldBlockNavigation && !shouldBlockNavigation(navigation)) return;

        // If custom modal handler is provided, use it
        if (onShowConfirmModal && navigation.to?.url) {
            navigation.cancel();
            const targetUrl = navigation.to.url.href;
            const handleConfirm = async () => {
                onConfirmNavigate?.();

                // eslint-disable-next-line
                await goto(targetUrl);
            };

            onShowConfirmModal(targetUrl, handleConfirm);
            return;
        }

        // Fallback to native confirm dialog
        if (!confirm(message)) {
            navigation.cancel();
            return;
        }

        onConfirmNavigate?.();
    });

    return { beforeUnload };
};
