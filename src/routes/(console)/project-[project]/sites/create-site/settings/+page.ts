import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ url }) => {
    const { installations } = await sdk.forProject.vcs.listInstallations();
    let template = null;
    if (url.searchParams.has('template')) {
        //Fetch the template
        template = mockTeplate;
    }
    return {
        template,
        installations
    };
};

const mockTeplate: {
    preview: string;
    name: string;
    frameworks: string[];
    $id: string;
} = {
    preview: 'https://unsplash.it/300/200',
    name: 'Template 1',
    frameworks: ['react', 'vue', 'angular'],
    $id: '1'
};
