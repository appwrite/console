import { sdk } from '$lib/stores/sdk';
import { getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';

export const load = async ({ url, route }) => {
    const limit = CARD_LIMIT;
    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);
    const filter = {
        useCases: url.searchParams.getAll('useCase'),
        frameworks: url.searchParams.getAll('framework')
    };

    const siteTemplatesList = await sdk.forProject.sites.listTemplates(undefined, undefined, 100);

    console.log(siteTemplatesList);

    const [frameworks, useCases] = siteTemplatesList.templates.reduce(
        ([fr, uc], next) => {
            next.useCases.forEach((useCase) => uc.add(useCase));
            // next.frameworks.forEach((framework) => fr.add(framework.name));
            return [fr, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    const templates = siteTemplatesList.templates.filter((template) => {
        // if (
        //     filter.framework.length > 0
        //     && !template.frameworks.some((n) => filter.frameworks.includes(n.name))
        // ) {
        //     return false;
        // }

        const filterLowerCases = filter.useCases.map((n) => n.toLowerCase());
        if (
            filter.useCases.length > 0 &&
            !template.useCases.some((n) => filterLowerCases.includes(n.toLowerCase()))
        ) {
            return false;
        }

        if (search) {
            return template.name.toLowerCase().includes(search.toLowerCase());
        } else {
            return true;
        }
    });

    templates.push(
        {
            name: 'Dashboard',
            preview:
                'https://upload.wikimedia.org/wikipedia/commons/4/40/Ceph_Dashboard_landing_page.webp',
            frameworks: [
                {
                    key: 'sveltekit',
                    name: 'SvelteKit',
                    installCommand: 'npm install --force',
                    buildCommand: 'npm run build',
                    outputDirectory: './build',
                    serveRuntime: 'static-1',
                    buildRuntime: 'node-22',
                    providerRootDirectory: './'
                },
                {
                    key: 'nextjs',
                    name: 'Next.js',
                    installCommand: 'npm install --force',
                    buildCommand: 'npm run build',
                    outputDirectory: './build',
                    serveRuntime: 'static-1',
                    buildRuntime: 'node-22',
                    providerRootDirectory: './'
                }
            ],
            useCases: ['chatbot'],
            $id: 'sadsadarwwa'
        },
        {
            name: 'Personal Blog',
            preview:
                'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/05724439-bbdf-4da1-b9dc-a2ec88879412/d4i24mv-71bd02d0-9d6c-4957-9a70-0dc90eba8122.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzA1NzI0NDM5LWJiZGYtNGRhMS1iOWRjLWEyZWM4ODg3OTQxMlwvZDRpMjRtdi03MWJkMDJkMC05ZDZjLTQ5NTctOWE3MC0wZGM5MGViYTgxMjIuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.FVKeww4kI23jYfCq8m6wt8kOEy0FK_HZKVDYSZJQ57o',
            frameworks: [
                {
                    key: 'sveltekit',
                    name: 'SvelteKit',
                    installCommand: 'npm install --force',
                    buildCommand: 'npm run build',
                    outputDirectory: './build',
                    serveRuntime: 'static-1',
                    buildRuntime: 'node-22',
                    providerRootDirectory: './'
                }
            ],
            useCases: ['chatbot'],
            $id: 'sadsadarwwa'
        }
    );
    console.dir(...templates);

    return {
        offset,
        limit,
        view,
        filter,
        frameworks,
        useCases,
        sum: templates.length,
        templates: templates.splice(((page === 0 ? 1 : page) - 1) * limit, limit)
    };
};
