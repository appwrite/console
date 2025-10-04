import type { Page } from '@sveltejs/kit';
import { page as pageState } from '$app/state';

import { useTerminology } from './terminology';
import { Submit, Click } from '$lib/actions/analytics';
import type { AnalyticsResult, TerminologyResult, TerminologyShape } from './types';

export function useAnalytics(pageOrTerms: Page | TerminologyResult = pageState): AnalyticsResult {
    const terminology = 'source' in pageOrTerms ? pageOrTerms : useTerminology(pageOrTerms);

    const createSubmitHandler = <TAction extends string>(termType: keyof TerminologyShape) => {
        return (action: TAction) => {
            const term = terminology.source[termType];
            if (!term) {
                throw new Error(`No ${termType} terminology found`);
            }
            const enumKey = `${term.title.singular}${action}`;
            return Submit[enumKey as keyof typeof Submit];
        };
    };

    const createClickHandler = <TAction extends string>(termType: keyof TerminologyShape) => {
        return (action: TAction) => {
            const term = terminology.source[termType];
            if (!term) {
                throw new Error(`No ${termType} terminology found`);
            }
            const enumKey = `Database${term.title.singular}${action}`;
            return Click[enumKey as keyof typeof Click];
        };
    };

    const result: AnalyticsResult = { submit: {}, click: {} };

    if (terminology.entity) {
        result.click.entity = createClickHandler('entity');
        result.submit.entity = createSubmitHandler('entity');
    }

    if (terminology.field) {
        result.click.field = createClickHandler('field');
        result.submit.field = createSubmitHandler('field');
    }

    if (terminology.record) {
        result.click.record = createClickHandler('record');
        result.submit.record = createSubmitHandler('record');
    }

    return result;
}
