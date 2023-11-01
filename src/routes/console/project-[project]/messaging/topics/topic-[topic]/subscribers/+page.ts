import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import type { Models } from '@appwrite.io/console';

export type Subscriber = {
    $id: string;
    $createdAt: string;
    targetId: string;
    topicId: string;
};

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);

    // TODO: remove when the API is ready with data
    // This allows us to mock w/ data and when search returns 0 results
    const subscribers: { subscribers: Subscriber[]; total: number } =
        await sdk.forProject.client.call(
            'GET',
            new URL(
                `${sdk.forProject.client.config.endpoint}/messaging/topics/${params.topic}/subscribers`
            ),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            }
        );

    const targetsById = new Map<string, Models.User<Models.Preferences>>();
    const userPromises = subscribers.subscribers.map((subscriber) =>
        sdk.forProject.users.get(subscriber.targetId)
    );
    for await (const user of userPromises) {
        targetsById.set(user.$id, user);
    }

    return {
        offset,
        limit,
        search,
        subscribers,
        targetsById
    };
};
