<script lang="ts">
    import {
        Platform,
        addPlatform
    } from '$routes/(console)/project-[region]-[project]/overview/platforms/+page.svelte';
    import Template from './template.svelte';

    let search = '';

    let platforms = [
        {
            label: 'Web',
            icon: 'code',
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Web);
            }
        },
        {
            label: 'Flutter',
            icon: 'flutter',
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Flutter);
            }
        },
        {
            label: 'Android',
            icon: 'android',
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Android);
            }
        },
        {
            label: 'Apple',
            icon: 'apple',
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Apple);
            }
        }
    ] as const;

    $: filteredPlatforms = platforms.filter((platform) => {
        return platform.label.toLowerCase().includes(search.toLowerCase());
    });
</script>

<Template options={filteredPlatforms} bind:search>
    <div class="u-flex u-cross-center u-gap-8" slot="option" let:option>
        <i class="icon-{option.icon}" />
        <span>{option.label}</span>
    </div>
</Template>
