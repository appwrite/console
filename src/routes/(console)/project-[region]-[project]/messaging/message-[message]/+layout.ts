import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';
import type { Models } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.MESSAGING_MESSAGE);

    try {
        const message = await sdk.forProject.messaging.getMessage(params.message);

        const topicsById: Record<string, Models.Topic> = {};
        const topicsPromise = Promise.allSettled(
            message.topics.map((topicId) => sdk.forProject.messaging.getTopic(topicId))
        ).then((results) => {
            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    topicsById[result.value.$id] = result.value;
                }
            });
        });

        const targetsById: Record<string, Models.Target> = {};
        const targetsPromise = sdk.forProject.messaging
            .listTargets(params.message)
            .then((response) => {
                response.targets.forEach((target) => {
                    targetsById[target.$id] = target;
                });
            });

        await Promise.allSettled([topicsPromise, targetsPromise]);

        const usersById: Record<string, Models.User<Models.Preferences>> = {};
        const usersPromise = Object.values(targetsById).map((target) =>
            sdk.forProject.users.get(target.userId).then((user) => {
                usersById[user.$id] = user;
            })
        );

        const messageRecipients: Record<string, Models.User<Models.Preferences>> = {};
        const messageRecipientsPromise = Object.values(message.users).map((userId) =>
            sdk.forProject.users
                .get(userId)
                .then((user) => {
                    messageRecipients[user.$id] = user;
                })
                .catch(() => {
                    messageRecipients[userId] = null;
                })
        );

        await Promise.allSettled([usersPromise, messageRecipientsPromise]);

        return {
            message,
            topicsById,
            targetsById,
            usersById,
            messageRecipients,
            header: Header,
            breadcrumbs: Breadcrumbs
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
