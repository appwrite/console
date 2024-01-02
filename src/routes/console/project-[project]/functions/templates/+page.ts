import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { marketplace } from '$lib/stores/marketplace';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route, depends }) => {
    depends(Dependencies.FUNCTIONS);

    const limit = CARD_LIMIT;
    const page = getPage(url);
    const search = getSearch(url);
    const view = getView(url, route, View.Grid);
    const offset = pageToOffset(page, limit);
    const filter = {
        useCases: url.searchParams.getAll('useCase'),
        runtimes: url.searchParams.getAll('runtime')
    };
    const [runtimes, useCases] = marketplace.reduce(
        ([rt, uc], next) => {
            next.runtimes.forEach((runtime) => rt.add(runtime.name));
            next.usecases.forEach((useCase) => uc.add(useCase));
            return [rt, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    const templates = marketplace.filter((template) => {
        if (
            filter.runtimes.length > 0 &&
            !template.runtimes.some((n) => filter.runtimes.includes(n.name))
        ) {
            return false;
        }

        if (
            filter.useCases.length > 0 &&
            !template.usecases.some((n) => filter.useCases.includes(n))
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
        offset,
        limit,
        view,
        filter,
        runtimes,
        useCases,
        sum: templates.length,
        templates: templates.splice(((page === 0 ? 1 : page) - 1) * limit, limit),
        functions: await sdk.forProject.functions.list()
    };
};
