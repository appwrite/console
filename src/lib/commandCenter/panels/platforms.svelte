<script lang="ts">
    import {
        Platform,
        addPlatform
    } from '$routes/(console)/project-[region]-[project]/overview/platforms/+page.svelte';
    import Template from './template.svelte';
    import { IconAndroid, IconApple, IconCode, IconFlutter } from '@appwrite.io/pink-icons-svelte';

    let search = '';

    let platforms = [
        {
            label: 'Web',
            icon: IconCode,
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Web);
            }
        },
        {
            label: 'Flutter',
            icon: IconFlutter,
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Flutter);
            }
        },
        {
            label: 'Android',
            icon: IconAndroid,
            group: 'platforms',
            callback: () => {
                addPlatform(Platform.Android);
            }
        },
        {
            label: 'Apple',
            icon: IconApple,
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
        <i class="icon-{option.icon}"></i>
        <span>{option.label}</span>
    </div>
</Template>
