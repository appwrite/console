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

    const useCasesSet = new Set<string>();
    const frameworksSet = new Set<string>();

    for (const template of siteTemplatesList.templates) {
        template.frameworks.forEach((f) => frameworksSet.add(f.name));
        template.useCases.forEach((u) => useCasesSet.add(u));
    }

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

    const frameworks = Array.from(frameworksSet).sort((a, b) => {
        const aIndex = frameworkOrder.indexOf(a);
        const bIndex = frameworkOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    const useCases = Array.from(useCasesSet).sort();

    const templates = siteTemplatesList.templates.filter((template) => {
        const matchesFramework =
            filter.frameworks.length === 0 ||
            template.frameworks.some((f) => filter.frameworks.includes(f.name));

        const matchesUseCase =
            filter.useCases.length === 0 ||
            template.useCases.some((u) =>
                filter.useCases.map((s) => s.toLowerCase()).includes(u.toLowerCase())
            );

        const matchesSearch = !search || template.name.toLowerCase().includes(search.toLowerCase());

        return matchesFramework && matchesUseCase && matchesSearch;
    });

    return {
        filter,
        frameworks,
        useCases,
        templates
    };
};
