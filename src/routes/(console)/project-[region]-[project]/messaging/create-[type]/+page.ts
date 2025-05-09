import { isValueOfStringEnum } from '$lib/helpers/types';
import { MessagingProviderType } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import Push from './(type)/push.svelte';
import Email from './(type)/email.svelte';
import Sms from './(type)/sms.svelte';

function getComponent(type: string) {
    switch (type) {
        case MessagingProviderType.Push:
            return Push;
        case MessagingProviderType.Email:
            return Email;
        case MessagingProviderType.Sms:
            return Sms;
        default:
            return null;
    }
}

export const load: PageLoad = async ({ params }) => {
    if (!isValueOfStringEnum(MessagingProviderType, params.type)) {
        error(401, 'Invalid provider type');
    }

    return {
        component: getComponent(params.type)
    };
};
