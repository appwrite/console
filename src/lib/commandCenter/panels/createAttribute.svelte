<script lang="ts">
    import { initCreateAttribute } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]/+layout.svelte';
    import { attributeOptions } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]/attributes/store';
    import Template from './template.svelte';

    let search = '';

    let options = attributeOptions.map((option) => {
        return {
            label: option.name,
            icon: option.icon,
            callback() {
                initCreateAttribute(option.name);
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
