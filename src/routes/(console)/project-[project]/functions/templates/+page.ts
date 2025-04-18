import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route, depends, parent }) => {
    depends(Dependencies.FUNCTIONS);

    const search = getSearch(url);
    const filter = {
        useCases: url.searchParams.getAll('useCase'),
        runtimes: url.searchParams.getAll('runtime')
    };

    const { templatesList } = await parent();

    const [runtimes, useCases] = templatesList.templates.reduce(
        ([rt, uc], next) => {
            next.runtimes.forEach((runtime) => rt.add(runtime.name));
            next.useCases.forEach((useCase) => uc.add(useCase));
            return [rt, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    const templates = templatesList.templates.filter((template) => {
        if (
            filter.runtimes.length > 0 &&
            !template.runtimes.some((n) => filter.runtimes.includes(n.name))
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
        runtimes,
        useCases,
        search,
        templates,
        functions: await sdk.forProject.functions.list()
    };
};
