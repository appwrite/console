import { Dependencies } from '$lib/constants';
import { Click, Submit } from '$lib/actions/analytics';
import type { baseTerminology, DatabaseType } from './terminology';

export type TerminologyShape = {
    entity: string;
    field?: string;
    record?: string;
};

export type Term = { singular: string; plural: string };

export type TerminologyResult = {
    type: DatabaseType;
    source: {
        entity?: { lower: Term; title: Term };
        field?: { lower: Term; title: Term };
        record?: { lower: Term; title: Term };
    };
    entity: { lower: Term; title: Term };
    field?: { lower: Term; title: Term };
    record?: { lower: Term; title: Term };
};

// for derived analytics!
type ExtractActionsForPrefix<TPrefix extends string> = {
    [K in keyof typeof Submit]: K extends `${TPrefix}${infer Action}` ? Action : never;
}[keyof typeof Submit];

type ExtractClickActionsForPrefix<TPrefix extends string> = {
    [K in keyof typeof Click]: K extends `Database${TPrefix}${infer Action}` ? Action : never;
}[keyof typeof Click];

type TermValuesForKey<TKey extends keyof TerminologyShape> = {
    [K in keyof typeof baseTerminology]: TKey extends keyof (typeof baseTerminology)[K]
        ? (typeof baseTerminology)[K][TKey]
        : never;
}[keyof typeof baseTerminology];

type SubmitActionsFor<TKey extends keyof TerminologyShape> = ExtractActionsForPrefix<
    Capitalize<TermValuesForKey<TKey>>
>;

type ClickActionsFor<TKey extends keyof TerminologyShape> = ExtractClickActionsForPrefix<
    Capitalize<TermValuesForKey<TKey>>
>;

export type AnalyticsResult = {
    submit: {
        entity?: (action: SubmitActionsFor<'entity'>) => Submit;
        field?: (action: SubmitActionsFor<'field'>) => Submit;
        record?: (action: SubmitActionsFor<'record'>) => Submit;
    };
    click: {
        entity?: (action: ClickActionsFor<'entity'>) => Click;
        field?: (action: ClickActionsFor<'field'>) => Click;
        record?: (action: ClickActionsFor<'record'>) => Click;
    };
};

// for derived dependencies!
export type DependenciesResult = {
    [K in keyof Omit<TerminologyResult, 'source' | 'type'>]: {
        singular: Dependencies;
        plural: Dependencies;
    };
};
