import type { Models } from '@appwrite.io/console';

type FuzzySearchOptions = {
    limit?: number;
    minOccurrences?: number | null;
};

/**
 * Finds common attribute keys across documents by analyzing their frequency.
 */
export function fuzzySearchKeys(
    documents: Models.Document[],
    options: FuzzySearchOptions = {}
): string[] | null {
    if (!documents || documents.length < 5) {
        return null;
    }

    const { minOccurrences = 2, limit } = options;

    const attributeCount = new Map<string, number>();
    const threshold = minOccurrences === null ? 5 : Math.max(2, Math.min(minOccurrences, 5));

    // Process only first 5 documents
    const docLimit = Math.min(5, documents.length);

    for (let docIndex = 0; docIndex < docLimit; docIndex++) {
        const document = documents[docIndex];
        if (!document || typeof document !== 'object') continue;

        // track per-document keys
        const seenInDoc = new Map<string, boolean>();

        for (const key in document) {
            if (key[0] === '$' || seenInDoc.has(key)) continue;

            seenInDoc.set(key, true);
            attributeCount.set(key, (attributeCount.get(key) || 0) + 1);
        }
    }

    const result: string[] = [];
    for (const [key, count] of attributeCount) {
        if (count >= threshold) {
            result.push(key);
        }
    }

    result.sort();

    return limit && limit > 0 ? result.slice(0, limit) : result;
}
