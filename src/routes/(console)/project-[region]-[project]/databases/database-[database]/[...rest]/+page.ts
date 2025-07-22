import { base } from '$app/paths';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { AppwriteException } from '@appwrite.io/console';

const LEGACY_ROUTE_MAPPINGS = [
    { pattern: /^collection-([^/]+)/, replacement: 'table-$1' },
    { pattern: /^document-([^/]+)/, replacement: 'row-$1' },
    { pattern: /^attribute-([^/]+)/, replacement: 'column-$1' }
] as const;

function isLegacyRoute(segments: string[]): boolean {
    return segments.some((segment) =>
        LEGACY_ROUTE_MAPPINGS.some((mapping) => mapping.pattern.test(segment))
    );
}

function rewriteLegacySegments(segments: string[]): string[] {
    return segments.map((segment) => {
        for (const mapping of LEGACY_ROUTE_MAPPINGS) {
            if (mapping.pattern.test(segment)) {
                return segment.replace(mapping.pattern, mapping.replacement);
            }
        }
        return segment;
    });
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
