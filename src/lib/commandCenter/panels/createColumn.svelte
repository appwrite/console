<script lang="ts">
    import { page } from '$app/stores';
    import { initCreateColumn } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/+layout.svelte';
    import { getSupportedColumns } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/columns/store';
    import type { DatabaseType } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/(entity)/helpers/terminology';
    import Template from './template.svelte';

    let search = '';

    $: options = getSupportedColumns($page.data.database?.type as DatabaseType).map((option) => {
        return {
            label: option.name,
            icon: option.icon,
            callback() {
                initCreateColumn(option.name);
            }
        };
    });

    $: filteredOptions = options.filter((option) => {
        return option.label.toLowerCase().includes(search.toLowerCase());
    });
</script>

<Template options={filteredOptions} bind:search>
    <div class="u-flex u-cross-center u-gap-8" slot="option" let:option>
        <i class="icon-{option.icon}"></i>
        <span>{option.label}</span>
    </div>
</Template>
