import { sdk } from '$lib/stores/sdk';
import { getSearch } from '$lib/helpers/load';

export const load = async ({ url, params }) => {
    const search = getSearch(url);
    const filter = {
        useCases: url.searchParams.getAll('useCase'),
        frameworks: url.searchParams.getAll('framework')
    };

    const siteTemplatesList = await sdk
        .forProject(params.region, params.project)
        .sites.listTemplates(undefined, undefined, 100);

    const [frameworksSet, useCasesSet] = siteTemplatesList.templates.reduce(
        ([fr, uc], next) => {
            next.useCases.forEach((useCase) => uc.add(useCase));
            next.frameworks.forEach((framework) => fr.add(framework.name));
            return [fr, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    const frameworkOrder = [
        'Next.js',
        'Nuxt',
        'SvelteKit',
        'Astro',
        'Remix',
        'Flutter',
        'React',
        'Vue.js',
        'Svelte',
        'Lynx',
        'Angular',
        'Analog',
        'Vite',
        'Other'
    ];
    const frameworks = Array.from(frameworksSet)
        .sort((a, b) => a.localeCompare(b))
        .sort((a, b) => {
            const aIndex = frameworkOrder.indexOf(a);
            const bIndex = frameworkOrder.indexOf(b);
            if (aIndex === -1 && bIndex === -1) {
                return a.localeCompare(b);
            } else if (aIndex === -1) {
                return 1;
            } else if (bIndex === -1) {
                return -1;
            }
            return aIndex - bIndex;
        });

    const useCases = Array.from(useCasesSet).sort((a, b) => a.localeCompare(b));

    const templates = siteTemplatesList.templates.filter((template) => {
        if (
            filter.frameworks.length > 0 &&
            !template.frameworks.some((n) => filter.frameworks.includes(n.name))
        ) {
            return false;
        }

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

    return {
        filter,
        frameworks,
        useCases,
        templates
    };
};
