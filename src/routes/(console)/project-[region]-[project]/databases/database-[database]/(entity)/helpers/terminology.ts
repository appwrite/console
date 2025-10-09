import type { Page } from '@sveltejs/kit';

import { capitalize, plural } from '$lib/helpers/string';
import type { Columns, Table } from '$database/table-[table]/store';
import { AppwriteException, type Models } from '@appwrite.io/console';
import type { Term, TerminologyResult, TerminologyShape } from '$database/(entity)/helpers/types';

export type DatabaseType = 'legacy' | 'tablesdb' | 'documentsdb' | 'vectordb';

export type Entity = Partial<Models.Collection | Table> & {
    indexes?: Index[];
    // TODO: will be updated in the DocumentsDB PR!
    fields?: Models.Collection['attributes'] | Table['columns'];
    recordSecurity?: Models.Collection['documentSecurity'] | Models.Table['rowSecurity'];
};

// TODO: will be updated in the DocumentsDB PR!
export type Field = Partial<Columns>;

export type Index = Partial<Models.Index | Models.ColumnIndex> & {
    fields: Models.Index['attributes'] | Models.ColumnIndex['columns'];
};

export const baseTerminology = {
    tablesdb: {
        entity: 'table',
        field: 'column',
        record: 'row'
    },
    documentsdb: {
        entity: 'collection',
        field: 'attribute',
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

const toIndex = (index: Models.Index | Models.ColumnIndex): Index => ({
    ...index,
    fields: (index as Models.Index).attributes ?? (index as Models.ColumnIndex).columns ?? []
});

/**
 * Transforms a raw `Collection` / `Table` model to normalized `Entity`.
 */
export function toSupportiveEntity(raw: Models.Collection | Models.Table): Entity {
    const isTable = 'columns' in raw;
    const indexes = raw.indexes?.map(toIndex) ?? [];

    const fields = isTable ? raw.columns : raw.attributes;
    const recordSecurity = isTable ? raw.rowSecurity : raw.documentSecurity;

    return {
        ...raw,
        fields,
        recordSecurity,
        indexes
    } as Entity;
}

/**
 * @internal
 * Use `getTerminologies()` instead when in `database-[database]` routes where context is available.
 */
export function useTerminology(page: Page): TerminologyResult {
    const type = page.data?.database?.type as DatabaseType;
    if (!type) {
        // strict check because this should always be available!
        throw new AppwriteException('Database type is required', 500);
    }

    const dbTerminologies = terminologyData[type] || {};
    return {
        source: dbTerminologies,
        field: dbTerminologies.field,
        record: dbTerminologies.record,
        entity: dbTerminologies.entity
    };
}
