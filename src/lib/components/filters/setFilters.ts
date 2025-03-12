import type { Column } from '$lib/helpers/types';
import { resetOptions, type FilterData } from './quickFilters';
import type { TagValue } from './store';

export function setFiltersOnNavigate(
    tags: TagValue[],
    filterCols: FilterData[],
    $columns: Column[]
) {
    if (!tags?.length) {
        filterCols.forEach((filter) => {
            resetOptions(filter);
        });
    } else {
        filterCols.forEach((filter) => {
            if (filter.id === 'buildDuration') {
                setTimeFilter(tags, filter, $columns);
            } else if (filter.id.includes('size')) {
                setSizeFilter(tags, filter, $columns);
            } else if (filter.id === 'statusCode') {
                setStatusCodeFilter(tags, filter, $columns);
            } else if (filter.id === '$createdAt' || filter.id === '$updatedAt') {
                setDateFilter(tags, filter, $columns);
            } else {
                setFilterData(filter, tags);
            }
        });

        // Reasinging the filters to trigger reactivity
        filterCols = filterCols;
    }
}

export function setFilterData(filter: FilterData, list: TagValue[]) {
    const tagData = list.find((tag) => tag.tag.includes(`**${filter.title}**`));
    if (tagData) {
        filter.tag = tagData.tag;
        if (Array.isArray(tagData.value) && tagData.value?.length) {
            const values = tagData.value as string[];
            filter.options.forEach((option) => {
                option.checked = values.includes(option.value);
            });
        }
    } else {
        filter.tag = null;
        resetOptions(filter);
    }
}

export function setTimeFilter(localTags: TagValue[], filter: FilterData, columns: Column[]) {
    const col = columns.find((c) => c.id === filter.id);
    const timeTag = localTags.find((tag) => tag.tag.includes(`**${filter.title}**`));
    if (timeTag) {
        const now = new Date();

        const diff = now.getTime() - new Date(timeTag.value as string).getTime();
        const ranges = col.elements as { value: string; label: string }[];
        const dateRange = ranges.reduce((prev, curr) => {
            if (parseInt(curr.value) < diff && curr.value > prev.value) {
                return curr;
            }
            return prev;
        });
        if (dateRange) {
            filter.tag = `**${filter.title}** is **${dateRange.label}**`;
            filter = filter;
        }
    } else {
        filter.tag = null;
    }
}

export function setSizeFilter(localTags: TagValue[], filter: FilterData, columns: Column[]) {
    const sizeTag = localTags.find((tag) => tag.tag.includes(`**${filter.title}**`));
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
            filter.tag = `**${filter.title}** is **${sizeRange.label}**`;
            filter = filter;
        }
    } else {
        filter.tag = null;
    }
}

export function setStatusCodeFilter(localTags: TagValue[], filter: FilterData, columns: Column[]) {
    const statusCodeTag = localTags.find((tag) => tag.tag.includes(`**${filter.title}**`));
    const col = columns.find((c) => c.id === filter.id);

    if (statusCodeTag) {
        const ranges = col.elements as { value: number; label: string }[];

        const codeRange = ranges.find((c) => c?.value && c.value === statusCodeTag.value);
        if (codeRange) {
            filter.tag = `**${filter.title}** is **${codeRange.label}**`;
            filter = filter;
        }
    } else {
        filter.tag = null;
    }
}

export function setDateFilter(localTags: TagValue[], filter: FilterData, columns: Column[]) {
    const dateTeag = localTags.find((tag) => tag.tag.includes(`**${filter.title}**`));
    const col = columns.find((c) => c.id === filter.id);
    if (dateTeag) {
        const now = new Date();

        const diff = now.getTime() - new Date(dateTeag.value as string).getTime();
        const ranges = col.elements as { value: string; label: string }[];
        const dateRange = ranges.reduce((prev, curr) => {
            if (parseInt(curr.value) < diff && curr.value > prev.value) {
                return curr;
            }
            return prev;
        });
        if (dateRange) {
            filter.tag = `**${filter.title}** is **${dateRange.label}**`;
            filter = filter;
        }
    } else {
        filter.tag = null;
    }
}
