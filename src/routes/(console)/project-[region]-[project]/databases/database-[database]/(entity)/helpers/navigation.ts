import { page } from '$app/state';
import type { RecordType } from '$database/(entity)';

export function buildFieldUrl(recordType: RecordType, recordId: string) {
    return `${page.url}/${recordType}-${recordId}`;
}
