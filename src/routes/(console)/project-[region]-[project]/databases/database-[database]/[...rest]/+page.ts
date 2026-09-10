import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { AppwriteException } from '@appwrite.io/console';
import { databaseRowSheetOptions } from '../table-[table]/store';
import { noSqlDocument } from '../collection-[collection]/store';
import { resolveRoute } from '$lib/stores/navigation';
import { toDatabaseType } from '$database/(entity)';

export const load: PageLoad = async ({ params, url, parent }) => {
    const restSegments = params.rest ? params.rest.split('/').filter(Boolean) : [];
    const baseUrl = resolveRoute(
        '/(console)/project-[region]-[project]/databases/database-[database]',
        params
    );

    if (restSegments.length === 0) {
        throw new AppwriteException('Not Found', 404);
    }

    const lastSegment = restSegments[restSegments.length - 1];

    const rowMatch = lastSegment.match(/^row-([^/]+)$/);
    if (rowMatch) {
        const rowId = rowMatch[1];
        databaseRowSheetOptions.update((options) => ({
            ...options,
            rowId,
            show: true,
            title: 'Update row'
        }));

        const parentSegments = restSegments.slice(0, -1);
        const newPath = `${baseUrl}/${parentSegments.join('/')}`;
        redirect(308, newPath + url.search);
    }

    const documentMatch = lastSegment.match(/^document-([^/]+)$/);
    if (documentMatch) {
        const documentId = documentMatch[1];
        const { database } = await parent();
        const type = toDatabaseType(database.type);

        if (type === 'legacy' || type === 'tablesdb') {
            databaseRowSheetOptions.update((options) => ({
                ...options,
                rowId: documentId,
                show: true,
                title: 'Update row'
            }));
        } else {
            noSqlDocument.update({ documentId });
        }

        const parentSegments = restSegments.slice(0, -1);
        const newPath = `${baseUrl}/${parentSegments.join('/')}`;
        redirect(308, newPath + url.search);
    }

    throw new AppwriteException('Not Found', 404);
};
