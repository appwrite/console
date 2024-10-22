import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export const load = async () => {
    const templates = {
        templates: mockTeplates,
        total: mockTeplates.length
    };

    return {
        siteTemplates: templates
    };
};

const mockTeplates: {
    preview: string;
    name: string;
    frameworks: string[];
    $id: string;
}[] = [
    {
        preview: 'https://unsplash.it/300/200',
        name: 'Template 1',
        frameworks: ['react', 'vue', 'angular'],
        $id: '1'
    },
    {
        preview: 'https://unsplash.it/301/200',
        name: 'Template 2',
        frameworks: ['react', 'vue'],
        $id: '2'
    },
    {
        preview: 'https://unsplash.it/302/200',
        name: 'Template 3',
        frameworks: ['react', 'angular'],
        $id: '3'
    },
    {
        preview: 'https://unsplash.it/303/200',
        name: 'Template 4',
        frameworks: ['vue', 'angular'],
        $id: '4'
    }
];
