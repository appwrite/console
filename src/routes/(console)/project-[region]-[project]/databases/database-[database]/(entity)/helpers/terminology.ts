import type { Page } from '@sveltejs/kit';
import { page as pageStage } from '$app/state';

import { type Models } from '@appwrite.io/console';
import { capitalize, plural } from '$lib/helpers/string';
import type { Columns } from '$database/table-[table]/store';
import type { Term, TerminologyResult, TerminologyShape } from '$database/(entity)/helpers/types';

export type DatabaseType = 'legacy' | 'tablesdb' | 'documentsdb' | 'vectordb';
export type Entity = Partial<Models.Table>;
export type Field = Partial<Columns>;

export const baseTerminology = {
    tablesdb: {
        entity: 'table',
        field: 'column',
        record: 'row'
    },
    documentsdb: {
        entity: 'collection',
        record: 'document'
    },
    legacy: {
        entity: 'collection',
        field: 'attribute',
        record: 'document'
    },
    vectordb: {}
} as const;

const createTerm = (singular: string, pluralForm: string): Term => {
    return { singular, plural: pluralForm };
};

// transforms a base into lower/title variants
const createTermVariants = (baseTerm: string) => ({
    lower: createTerm(baseTerm, plural(baseTerm)),
    title: createTerm(capitalize(baseTerm), plural(capitalize(baseTerm)))
});

// transforms terminology for a database type
const transformDatabaseTerms = (terms: Partial<TerminologyShape>) =>
    Object.fromEntries(
        Object.entries(terms).map(([key, term]) => [
            key,
            term ? createTermVariants(term) : undefined
        ])
    );

// build the terminology data
const terminologyData = Object.fromEntries(
    Object.entries(baseTerminology).map(([dbType, terms]) => [
        dbType,
        transformDatabaseTerms(terms)
    ])
);

export function useTerminology(page: Page = pageStage): TerminologyResult {
    const type = page.data?.database?.type as DatabaseType;
    const dbTerminologies = terminologyData[type] || {};
    return {
        source: dbTerminologies,
        field: dbTerminologies.field,
        record: dbTerminologies.record,
        entity: dbTerminologies.entity
    };
}
