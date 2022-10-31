<script lang="ts">
    import { page } from '$app/stores';
    import { DropList, DropListItem, GridItem1, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import CreateAndroid from './createAndroid.svelte';
    import CreateApple from './createApple.svelte';
    import CreateFlutter from './createFlutter.svelte';
    import CreateWeb from './createWeb.svelte';
    import { versions } from './wizard/store';
    import type { PageData } from './$types';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';

    export let data: PageData;

    let showDropdown = false;
    const path = `/console/project-${$page.params.project}/overview/platforms`;

    enum Platform {
        Web,
        Flutter,
        Android,
        Apple
    }

    const platforms = {
        [Platform.Web]: CreateWeb,
        [Platform.Flutter]: CreateFlutter,
        [Platform.Android]: CreateAndroid,
        [Platform.Apple]: CreateApple
    };

    const getPlatformInfo = (platform: string) => {
        if (platform.includes('flutter')) {
            return 'color/flutter';
        } else if (platform.includes('apple')) {
            return 'color/apple';
        } else if (platform.includes('android')) {
            return 'color/android';
        } else if (platform.includes('web')) {
            return 'grayscale/code';
        } else {
            return 'unknown';
        }
    };

    async function addPlatform(type: Platform) {
        await versions.load();
        wizard.start(platforms[type]);
    }
</script>

<div class="common-section u-flex u-gap-12">
    <Heading tag="h3" size="7">Platforms</Heading>
    <span class="u-margin-inline-start-auto">
        <DropList bind:show={showDropdown} placement="bottom-start">
            <Button on:click={() => (showDropdown = !showDropdown)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add platform</span>
            </Button>
            <svelte:fragment slot="list">
                <DropListItem on:click={() => addPlatform(Platform.Web)}>Web App</DropListItem>
                <DropListItem on:click={() => addPlatform(Platform.Flutter)}>
                    Flutter App
                </DropListItem>
                <DropListItem on:click={() => addPlatform(Platform.Android)}>
                    Android App
                </DropListItem>
                <DropListItem on:click={() => addPlatform(Platform.Apple)}>Apple App</DropListItem>
            </svelte:fragment>
        </DropList>
    </span>
</div>

<div class="grid-box u-margin-block-start-32" style="--grid-gap:1.5rem; --grid-item-size:25rem;">
    {#each data.platforms.platforms as platform}
        <GridItem1 href={`${path}/${platform.$id}`}>
            <svelte:fragment slot="title">
                <div class="u-flex u-gap-8 u-cross-center">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/${getPlatformInfo(
                                platform.type.toLowerCase()
                            )}.svg`}
                            alt="technology" />
                    </div>
                    <span class="text">{platform.name}</span>
                </div>
            </svelte:fragment>
            <div class="grid-item-1-end-start">
                <p>Last Updated</p>
                <p>{toLocaleDateTime(platform.$updatedAt)}</p>
            </div>
        </GridItem1>
    {/each}
</div>
