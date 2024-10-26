import { sdk } from '$lib/stores/sdk';

export const load = async ({ parent, params }) => {
    const { installations, frameworks } = await parent();
    let template = await sdk.forProject.sites.getTemplate(params.template);
    console.log(template);
    template.frameworks = [
        {
            name: 'sveltekit',
            installCommand: 'npm install',
            buildCommand: 'npm run build',
            outputDirectory: 'build',
            fallbackRedirect: 'index.html',
            providerRootDirectory: 'public'
        },
        {
            name: 'nuxtjs',
            installCommand: 'npm install',
            buildCommand: 'npm run build',
            outputDirectory: 'dist',
            fallbackRedirect: 'index.html',
            providerRootDirectory: 'static'
        }
    ];

    return {
        installations,
        frameworks,
        template
    };
};
