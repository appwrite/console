import { sdk } from '$lib/stores/sdk';
import { getSearch, getView, View } from '$lib/helpers/load';

export const load = async ({ url, route }) => {
    const search = getSearch(url);
    const filter = {
        useCases: url.searchParams.getAll('useCase'),
        frameworks: url.searchParams.getAll('framework')
    };

    const siteTemplatesList = await sdk.forProject.sites.listTemplates(undefined, undefined, 100);

    const [frameworksSet, useCasesSet] = siteTemplatesList.templates.reduce(
        ([fr, uc], next) => {
            next.useCases.forEach((useCase) => uc.add(useCase));
            next.frameworks.forEach((framework) => fr.add(framework.name));
            return [fr, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    const frameworks = Array.from(frameworksSet).sort((a, b) => a.localeCompare(b));
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
