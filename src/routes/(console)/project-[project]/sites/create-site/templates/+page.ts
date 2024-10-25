import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getPage, getSearch, getView, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';

export const load = async ({ url }) => {
    const limit = CARD_LIMIT;
    const page = getPage(url);
    const search = getSearch(url);
    const offset = pageToOffset(page, limit);
    const templates = {
        templates: mockTemplates,
        total: mockTemplates.length
    };

    return {
        offset,
        limit,
        search,
        siteTemplates: templates
    };
};

const mockTemplates: {
    $id: string;
    name: string;
    description: string;
    preview: string;
    frameworks: string[];
}[] = [
    {
        $id: '1',
        name: 'Template 1',
        description: 'This is a description',
        preview: 'https://unsplash.it/300/200',
        frameworks: ['react', 'vue', 'angular']
    },
    {
        $id: '2',
        name: 'Template 2',
        description: 'Yet another description',
        preview: 'https://unsplash.it/301/200',
        frameworks: ['react', 'vue']
    },
    {
        $id: '3',
        name: 'Template 3',
        description: 'This is a description too',
        preview: 'https://unsplash.it/302/200',
        frameworks: ['react', 'angular']
    },
    {
        $id: '4',
        name: 'Template 4',
        description: 'This is a description too but it is very long',
        preview: 'https://unsplash.it/303/200',
        frameworks: ['vue', 'angular']
    }
];
