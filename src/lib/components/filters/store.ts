import { goto } from '$app/navigation';
import { page } from '$app/stores';
import deepEqual from 'deep-equal';
import { Query } from '@appwrite.io/console';
import { toLocaleDateTime } from '$lib/helpers/date';
import { derived, get, writable } from 'svelte/store';
import type { Column, ColumnType } from '$lib/helpers/types';
import { isSpatialType } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/rows/store';

export type TagValue = {
    tag: string;
    value: string | number | string[];
};

export type Operator = {
    toTag: (column: string, input?: string | number | string[], type?: string) => TagValue;
    toQuery: (column: string, input?: string | number | string[], distance?: number) => string;
    types: ColumnType[];
    hideInput?: boolean;
};

export function mapToQueryParams(map: Map<TagValue, string>) {
    return encodeURIComponent(JSON.stringify(Array.from(map.entries())));
}

export function queryParamToMap(queryParam: string) {
    const decodedQueryParam = decodeURIComponent(queryParam);
    const queries = JSON.parse(decodedQueryParam) as [TagValue, string][];
    return new Map(queries);
}

function initQueries(initialValue = new Map<TagValue, string>()) {
    const queries = writable(initialValue);

    type AddFilterArgs = {
        operator: Operator;
        column: Column;
        value: string | number | string[];
        distance?: number;
    };

    function addFilter({ column, operator, value, distance }: AddFilterArgs) {
        queries.update((map) => {
            map.set(
                operator.toTag(column.title, value, column?.type),
                operator.toQuery(column.id, value, distance)
            );
            return map;
        });
    }

    function removeFilter(tag: TagValue) {
        queries.update((map) => {
            map.delete(tag);
            return map;
        });
    }

    function clearAll() {
        queries.set(new Map());
    }

    function apply() {
        const usableQueries = get(queries);
        const currentLocation = window.location.pathname;

        if (usableQueries.size) {
            const queryParam = mapToQueryParams(usableQueries);
            goto(`${currentLocation}?query=${queryParam}`, { noScroll: true });
        } else {
            goto(currentLocation, { noScroll: true });
        }
    }

    return {
        ...queries,
        addFilter,
        removeFilter,
        clearAll,
        apply
    };
}

export const queries = initQueries();
export const queriesAreDirty = derived([queries, page], ([$queries, $page]) => {
    const paramQueries = $page.url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');

    return !deepEqual($queries, parsedQueries);
});

export const hasPageQueries = derived(page, ($page) => {
    const paramQueries = $page.url.searchParams.get('query');
    const parsedQueries = queryParamToMap(paramQueries || '[]');
    return parsedQueries.size > 0;
});

export const tags = derived(queries, ($queries) => Array.from($queries.keys()));

/* eslint  @typescript-eslint/no-explicit-any: 'off' */
export function addFilter(
    columns: Column[],
    columnId: string,
    operatorKey: string,
    value: any, // We cast to any to not cause type errors in the input components
    arrayValues: string[] = [],
    distance?: number
) {
    const operator = operatorKey ? operators[operatorKey] : null;
    const column = columns.find((c) => c.id === columnId) as Column;
    if (!column || !operator) return;

    if (column.array) {
        queries.addFilter({ column, operator, value: arrayValues, distance });
    } else {
        const isSpatialArrayWrappingRequired =
            isSpatialType(column) &&
            [
                ValidOperators.Contains,
                ValidOperators.Equal,
                ValidOperators.NotEqual,
                ValidOperators.NotContains
            ].includes(operatorKey as ValidOperators);
        const preparedValue =
            isSpatialArrayWrappingRequired && value != null ? [value] : (value ?? '');
        queries.addFilter({ column, operator, value: preparedValue, distance });
    }
}

export enum ValidOperators {
    StartsWith = 'starts with',
    EndsWith = 'ends with',
    GreaterThan = 'greater than',
    GreaterThanOrEqual = 'greater than or equal',
    LessThan = 'less than',
    LessThanOrEqual = 'less than or equal',
    Equal = 'equal',
    NotEqual = 'not equal',
    IsNotNull = 'is not null',
    IsNull = 'is null',
    Contains = 'contains',
    NotContains = 'not contains',
    Crosses = 'crosses',
    NotCrosses = 'not crosses',
    DistanceEqual = 'distance equal',
    DistanceNotEqual = 'distance not equal',
    DistanceGreaterThan = 'distance greater than',
    DistanceLessThan = 'distance less than',
    Intersects = 'intersects',
    NotIntersects = 'not intersects',
    Overlaps = 'overlaps',
    NotOverlaps = 'not overlaps',
    Touches = 'touches',
    NotTouches = 'not touches'
}

export enum ValidTypes {
    String = 'string',
    Integer = 'integer',
    Double = 'double',
    Boolean = 'boolean',
    Datetime = 'datetime',
    Relationship = 'relationship',
    Enum = 'enum',
    Point = 'point',
    Line = 'linestring',
    Polygon = 'polygon'
}

const operatorsDefault = new Map<
    ValidOperators,
    {
        query: (col: string, input: string | number | string[], distance?: number) => string;
        types: ColumnType[];
        hideInput?: boolean;
    }
>([
    [ValidOperators.StartsWith, { query: Query.startsWith, types: [ValidTypes.String] }],
    [ValidOperators.EndsWith, { query: Query.endsWith, types: [ValidTypes.String] }],
    [
        ValidOperators.GreaterThan,
        {
            query: Query.greaterThan,
            types: [ValidTypes.Integer, ValidTypes.Double, ValidTypes.Datetime]
        }
    ],
    [
        ValidOperators.GreaterThanOrEqual,
        {
            query: Query.greaterThanEqual,
            types: [ValidTypes.Integer, ValidTypes.Double, ValidTypes.Datetime]
        }
    ],
    [
        ValidOperators.LessThan,
        {
            query: Query.lessThan,
            types: [ValidTypes.Integer, ValidTypes.Double, ValidTypes.Datetime]
        }
    ],
    [
        ValidOperators.LessThanOrEqual,
        {
            query: Query.lessThanEqual,
            types: [ValidTypes.Integer, ValidTypes.Double, ValidTypes.Datetime]
        }
    ],
    [
        ValidOperators.Equal,
        {
            query: Query.equal,
            types: [
                ValidTypes.String,
                ValidTypes.Integer,
                ValidTypes.Double,
                ValidTypes.Boolean,
                ValidTypes.Enum,
                ValidTypes.Point,
                ValidTypes.Line,
                ValidTypes.Polygon
            ]
        }
    ],
    [
        ValidOperators.NotEqual,
        {
            query: Query.notEqual,
            types: [
                ValidTypes.String,
                ValidTypes.Integer,
                ValidTypes.Double,
                ValidTypes.Boolean,
                ValidTypes.Point,
                ValidTypes.Line,
                ValidTypes.Polygon
            ]
        }
    ],
    [
        ValidOperators.IsNotNull,
        {
            query: Query.isNotNull,
            types: [
                ValidTypes.String,
                ValidTypes.Integer,
                ValidTypes.Double,
                ValidTypes.Boolean,
                ValidTypes.Datetime,
                ValidTypes.Relationship,
                ValidTypes.Point,
                ValidTypes.Line,
                ValidTypes.Polygon
            ],
            hideInput: true
        }
    ],
    [
        ValidOperators.IsNull,
        {
            query: Query.isNull,
            types: [
                ValidTypes.String,
                ValidTypes.Integer,
                ValidTypes.Double,
                ValidTypes.Boolean,
                ValidTypes.Datetime,
                ValidTypes.Relationship,
                ValidTypes.Point,
                ValidTypes.Line,
                ValidTypes.Polygon
            ],
            hideInput: true
        }
    ],
    [
        ValidOperators.Contains,
        {
            query: Query.contains,
            types: [
                ValidTypes.String,
                ValidTypes.Integer,
                ValidTypes.Double,
                ValidTypes.Boolean,
                ValidTypes.Datetime,
                ValidTypes.Enum,
                ValidTypes.Point,
                ValidTypes.Line,
                ValidTypes.Polygon
            ]
        }
    ],
    [
        ValidOperators.NotContains,
        {
            query: Query.contains,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.Crosses,
        {
            query: Query.crosses,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.NotCrosses,
        {
            query: Query.notCrosses,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.DistanceEqual,
        {
            query: Query.distanceEqual,
            types: [ValidTypes.Point]
        }
    ],
    [
        ValidOperators.DistanceNotEqual,
        {
            query: Query.distanceNotEqual,
            types: [ValidTypes.Point]
        }
    ],
    [
        ValidOperators.DistanceGreaterThan,
        {
            query: Query.distanceGreaterThan,
            types: [ValidTypes.Point]
        }
    ],
    [
        ValidOperators.DistanceLessThan,
        {
            query: Query.distanceLessThan,
            types: [ValidTypes.Point]
        }
    ],
    [
        ValidOperators.Intersects,
        {
            query: Query.intersects,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.NotIntersects,
        {
            query: Query.notIntersects,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.Overlaps,
        {
            query: Query.overlaps,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.NotOverlaps,
        {
            query: Query.notOverlaps,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.Touches,
        {
            query: Query.touches,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ],
    [
        ValidOperators.NotTouches,
        {
            query: Query.notTouches,
            types: [ValidTypes.Point, ValidTypes.Line, ValidTypes.Polygon]
        }
    ]
]);

function formatArray(array: string[]) {
    if (!array?.length) return;
    if (array.length > 2) {
        return `${array[0]} or ${array.length - 1} others`;
    } else {
        return array.join(' or ');
    }
}

export function generateDefaultOperators() {
    const operators: Record<string, Operator> = {};
    operatorsDefault.forEach((operator, operatorName) => {
        operators[operatorName] = {
            toQuery: operator.query,
            toTag: (column, input = null, type = null) => {
                return generateTag(column, operatorName, input, type);
            },
            types: operator.types,
            hideInput: operator.hideInput
        };
    });
    return operators;
}

export function generateTag(column: string, operatorName: string, input = null, type = null) {
    if (input === null) {
        return {
            value: '',
            tag: `**${column}** ${operatorName}`
        };
    } else if (Array.isArray(input) && input.length > 2) {
        return {
            value: input,
            tag: `**${column}** ${operatorName} **${formatArray(input)}** `
        };
    } else if (type === ValidTypes.Datetime) {
        return {
            value: input,
            tag: `**${column}** ${operatorName} **${toLocaleDateTime(input.toString())}**`
        };
    } else {
        return { value: input, tag: `**${column}** ${operatorName} **${input}**` };
    }
}

export const operators = generateDefaultOperators();

export function tagFormat(node: HTMLElement) {
    node.innerHTML = node.innerHTML.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}
