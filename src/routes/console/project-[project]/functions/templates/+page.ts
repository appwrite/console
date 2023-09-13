import { CARD_LIMIT } from '$lib/constants';
import { getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { marketplace } from '$lib/stores/marketplace';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, route }) => {
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
            next.runtimes.forEach((runtime) => rt.add(runtime.name.split('-')[0]));
            next.usecases.forEach((useCase) => uc.add(useCase));
            return [rt, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    const templates = marketplace
        .filter((template) => {
            if (
                filter.runtimes.length > 0 &&
                !template.runtimes.some((runtime) =>
                    filter.runtimes.includes(runtime.name.split('-')[0])
                )
            ) {
                return false;
            }

            if (
                filter.useCases.length > 0 &&
                !template.usecases.some((useCase) => filter.useCases.includes(useCase))
            ) {
                return false;
            }

            if (search) {
                return template.name.toLowerCase().includes(search.toLowerCase());
            } else {
                return true;
            }
        })
        .map((template) => ({
            ...template,
            runtimes: template.runtimes
                .map((runtime) => ({ ...runtime, name: runtime.name.split('-')[0] }))
                .filter(
                    (runtime, index, self) =>
                        self.findIndex((n) => n.name === runtime.name) === index
                )
        }));

    return {
        offset,
        limit,
        view,
        filter,
        runtimes,
        useCases,
        sum: templates.length,
        templates: templates.splice(((page === 0 ? 1 : page) - 1) * limit, limit)
    };
};
