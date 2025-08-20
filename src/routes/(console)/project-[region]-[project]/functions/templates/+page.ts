import { Dependencies } from '$lib/constants';
import { getSearch } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, depends, params }) => {
    depends(Dependencies.FUNCTIONS);

    const search = getSearch(url);
    const filter = {
        useCases: url.searchParams.getAll('useCase'),
        runtimes: url.searchParams.getAll('runtime')
    };

    const { templates: allTemplates } = await sdk
        .forProject(params.region, params.project)
        .functions.listTemplates(undefined, undefined, 100);

    const runtimes = new Set<string>();
    const useCases = new Set<string>();

    for (const template of allTemplates) {
        template.runtimes.forEach((r) => runtimes.add(r.name));
        template.useCases.forEach((u) => useCases.add(u));
    }

    const filterUseCasesLower = filter.useCases.map((u) => u.toLowerCase());

    const templates = allTemplates.filter((template) => {
        if (
            filter.runtimes.length > 0 &&
            !template.runtimes.some((n) => filter.runtimes.includes(n.name))
        ) {
            return false;
        }
        if (
            filter.useCases.length > 0 &&
            !template.useCases.some((u) => filterUseCasesLower.includes(u.toLowerCase()))
        ) {
            return false;
        }
        return search ? template.name.toLowerCase().includes(search.toLowerCase()) : true;
    });

    return {
        filter,
        runtimes,
        useCases,
        search,
        templates
    };
};
