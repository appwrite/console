import type { Page } from '@sveltejs/kit';
import { page as pageState } from '$app/state';

import { useTerminology } from './terminology';
import { Dependencies } from '$lib/constants';
import type { DependenciesResult, Term, TerminologyResult } from './types';

export function useDependencies(
    pageOrTerms: Page | TerminologyResult = pageState
): DependenciesResult {
    // source is in `TerminologyResult`.
    const terminology = 'source' in pageOrTerms ? pageOrTerms : useTerminology(pageOrTerms);

    const getDependencies = (term: { title: Term }) => ({
        singular: Dependencies[term.title.singular.toUpperCase() as keyof typeof Dependencies],
        plural: Dependencies[term.title.plural.toUpperCase() as keyof typeof Dependencies]
    });

    return {
        entity: terminology.entity ? getDependencies(terminology.entity) : undefined,
        field: terminology.field ? getDependencies(terminology.field) : undefined,
        record: terminology.record ? getDependencies(terminology.record) : undefined
    };
}
