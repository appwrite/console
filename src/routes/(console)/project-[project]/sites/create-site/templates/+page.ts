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

    console.log(frameworks, useCases, templates);

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