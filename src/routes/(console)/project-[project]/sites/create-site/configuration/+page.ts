import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ url }) => {
    const installations = await sdk.forProject.vcs.listInstallations();
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
    variables: Models.TemplateVariable[];
} = {
    preview: 'https://unsplash.it/300/200',
    name: 'Template 1',
    frameworks: ['sveltekit', 'nextje'],
    $id: '1',
    variables: [
        {
            name: 'API_KEY',
            type: 'url',
            description: 'A very important API Key',
            placeholder: 'elkfok430r0-i3d',
            required: false,
            value: ''
        },
        {
            name: 'API_SECRET',
            type: 'password',
            description: 'A very important API Secret',
            placeholder: '32rd23r32t4',
            required: true,
            value: ''
        }
    ]
};
