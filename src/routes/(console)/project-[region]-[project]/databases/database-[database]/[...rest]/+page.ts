import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { AppwriteException } from '@appwrite.io/console';
import { databaseRowSheetOptions } from '../table-[table]/store';

const ROUTE_MAPPINGS: {
    pattern: RegExp;
    replacement?: string;
    sheet?: 'row' | 'column';
}[] = [
    // collection page redirect to table
    { pattern: /^collection-([^/]+)/, replacement: 'table-$1' },

    // document detail page redirect to their parent table
    { pattern: /^document-([^/]+)/, sheet: 'row' },

    // attributes list page redirect to table columns
    { pattern: /^attributes$/, replacement: 'columns' },

    // New format routes,
    { pattern: /^row-([^/]+)/, sheet: 'row' }
] as const;

function isLegacyRoute(segments: string[]): boolean {
    return segments.some((segment) =>
        ROUTE_MAPPINGS.some((mapping) => mapping.pattern.test(segment))
    );
}

function rewriteLegacySegments(segments: string[]): string[] {
    return segments
        .map((segment) => {
            for (const mapping of ROUTE_MAPPINGS) {
                if (mapping.pattern.test(segment)) {
                    if (mapping.sheet && mapping.sheet === 'row') {
                        const match = segment.match(mapping.pattern);
                        if (match && match[1]) {
                            databaseRowSheetOptions.update((options) => ({
                                ...options,
                                rowId: match[1],
                                title: 'Update row',
                            }));
                        }
                    }

                    return !mapping.replacement
                        ? null
                        : segment.replace(mapping.pattern, mapping.replacement);
                }
            }
            return segment;
        })
        .filter(Boolean);
}

export const load: PageLoad = async ({ params, url }) => {
    const restSegments = params.rest ? params.rest.split('/').filter(Boolean) : [];
    const baseUrl = `${base}/project-${params.region}-${params.project}/databases/database-${params.database}`;

    if (isLegacyRoute(restSegments)) {
        const rewrittenSegments = rewriteLegacySegments(restSegments);
        const newPath = `${baseUrl}/${rewrittenSegments.join('/')}`;

        redirect(308, newPath + url.search);
    }

    throw new AppwriteException('Not Found', 404);
};
