import type { Column } from '$lib/helpers/types';
import { get, writable } from 'svelte/store';
import { type FilterData } from './quickFilters';
import { tags, type TagValue } from './store';

export const parsedTags = writable<TagValue[]>([]);

export function setFilters(localTags: TagValue[], filterCols: FilterData[], $columns: Column[]) {
    if (!localTags?.length) {
        filterCols.forEach((filter) => {
            resetOptions(filter);
            cleanOldTags(filter?.title);
        });
    } else {
        filterCols.forEach((filter) => {
            const id = filter?.id?.toLowerCase();
            if (id?.includes('duration')) {
                setTimeFilter(filter, $columns);
            } else if (id?.includes('size')) {
                setSizeFilter(filter, $columns);
            } else if (id?.includes('statuscode')) {
                setStatusCodeFilter(filter, $columns);
            } else if (
                id === '$createdat' ||
                id === '$updatedat' ||
                id === 'scheduledat' ||
                id === 'deliveredat'
            ) {
                setDateFilter(filter, $columns);
            } else {
                setFilterData(filter);
            }
        });

        // Reassigning the filters to trigger reactivity
        filterCols = [...filterCols];
    }
}

export function setFilterData(filter: FilterData) {
    const tagData = get(tags).find((tag) => tag.tag.includes(`**${filter.title}**`));
    if (tagData) {
        if (Array.isArray(tagData.value) && tagData.value?.length) {
            const values = tagData.value as string[];
            filter.options.forEach((option) => {
                option.checked = values.includes(option.value);
            });
        }
        cleanOldTags(filter?.title);
        const newTag = {
            tag: tagData.tag.replace(',', ' or '),
            value: tagData.value
        };

        parsedTags.update((tags) => {
            tags.push(newTag);
            return tags;
        });
    } else {
        resetOptions(filter);
        cleanOldTags(filter?.title);
    }
}

export function setTimeFilter(filter: FilterData, columns: Column[]) {
    const col = columns.find((c) => c.id === filter.id);
    const timeTag = get(tags).find((tag) => tag.tag.includes(`**${filter.title}**`));
    if (timeTag) {
        const ranges = col.elements as { value: string; label: string }[];
        const timeRange = ranges.find((range) => range.value === timeTag.value);
        if (timeRange) {
            const newTag = {
                tag: `**${filter.title}** is **${timeRange.label}**`,
                value: timeRange.value
            };

            cleanOldTags(filter?.title);

            parsedTags.update((tags) => {
                tags.push(newTag);
                return tags;
            });
        }
    } else {
        cleanOldTags(filter?.title);
    }
}

export function setSizeFilter(filter: FilterData, columns: Column[]) {
    const sizeTag = get(tags).find((tag) => tag.tag.includes(`**${filter.title}**`));
    const col = columns.find((c) => c.id === filter.id);
    if (sizeTag) {
        const size = sizeTag.value as string;
        const ranges = col.elements as { value: string; label: string }[];
        // find smallest range that is bigger than size
        const sizeRange = ranges.reduce((prev, curr) => {
            if (parseInt(size) >= parseInt(curr.value)) {
                return curr;
            }
            return prev;
        });
        if (sizeRange) {
            cleanOldTags(filter?.title);

            const newTag = {
                tag: `**${filter.title}** is **${sizeRange.label}**`,
                value: sizeTag.value
            };
            parsedTags.update((tags) => {
                tags.push(newTag);
                return tags;
            });
        }
    } else {
        cleanOldTags(filter?.title);
    }
}

export function setStatusCodeFilter(filter: FilterData, columns: Column[]) {
    const statusCodeTag = get(tags).find((tag) => tag.tag.includes(`**${filter.title}**`));
    const col = columns.find((c) => c.id === filter.id);

    if (statusCodeTag) {
        const ranges = col.elements as { value: number; label: string }[];

        const codeRange = ranges.find((c) => c?.value && c.value === statusCodeTag.value);
        if (codeRange) {
            cleanOldTags(filter?.title);
            const newTag = {
                tag: `**${filter.title}** is **${codeRange.label}**`,
                value: statusCodeTag.value
            };
            parsedTags.update((tags) => {
                tags.push(newTag);
                return tags;
            });
        }
    } else {
        cleanOldTags(filter?.title);
    }
}

export function setDateFilter(filter: FilterData, columns: Column[]) {
    const dateTag = get(tags).find((tag) => tag.tag.includes(`**${filter.title}**`));
    const col = columns.find((c) => c.id === filter.id);
    if (dateTag) {
        const now = new Date();

        const diff = now.getTime() - new Date(dateTag.value as string).getTime();
        const ranges = col.elements as { value: string; label: string }[];
        const dateRange = ranges.reduce((prev, curr) => {
            if (parseInt(curr.value) < diff && curr.value > prev.value) {
                return curr;
            }
            return prev;
        });
        if (dateRange) {
            cleanOldTags(filter?.title);
            const newTag = {
                tag: `**${filter.title}** is **${dateRange.label}**`,
                value: dateTag.value
            };
            parsedTags.update((tags) => {
                tags.push(newTag);
                return tags;
            });
        }
    } else {
        cleanOldTags(filter?.title);
    }
}

function cleanOldTags(title: string) {
    if (!title) return;
    parsedTags.update((tags) => {
        tags = tags.filter((tag) => !tag.tag.includes(`**${title}**`));
        return tags;
    });
}

export function resetOptions(filter: FilterData) {
    if (!filter?.options) return;
    filter.options.forEach((option) => {
        option.checked = false;
    });
}
