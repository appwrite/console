import { beforeNavigate } from '$app/navigation';
import type { BeforeNavigate } from '@sveltejs/kit';

type UnsavedChangesGuardOptions = {
    message?: string;
    hasUnsavedChanges: () => boolean;
    onConfirmNavigate?: () => void;
    shouldBlockNavigation?: (navigation: BeforeNavigate) => boolean;
};

export const setupUnsavedChangesGuard = ({
    message,
    hasUnsavedChanges,
    onConfirmNavigate,
    shouldBlockNavigation
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

        if (!confirm(message)) {
            navigation.cancel();
            return;
        }

        onConfirmNavigate?.();
    });

    return { beforeUnload };
};
