<script lang="ts">
    import { Card, Layout, Typography, Input } from '@appwrite.io/pink-svelte';
    import { CustomId } from '$lib/components/index.js';
    import type { RegionList } from '$lib/sdk/billing';
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Flag } from '@appwrite.io/console';

    let showCustomId = true;
    let id: string;

    let regions: RegionList;
    onMount(async () => {
        if (isCloud) {
            regions = await sdk.forConsole.billing.listRegions();
        }
    });

    function getFlagUrl(countryCode: string) {
        if (!isValueOfStringEnum(Flag, countryCode)) return '';
        return sdk.forProject.avatars.getFlag(countryCode, 22, 15, 100)?.toString();
    }
</script>

<div class="page-container u-flex-vertical u-cross-child-center u-main-center u-cross-center">
    <img
        src="/console/images/appwrite-logo-light.svg"
        width="120"
        height="22"
        class="u-only-light"
        alt="Appwrite Logo" />
    <img
        src="/console/images/appwrite-logo-dark.svg"
        width="120"
        height="22"
        class="u-only-dark"
        alt="Appwrite Logo" />
    <Card.Base variant="primary"
        ><Layout.Stack direction="column" gap="xxl">
            <Typography.Title size="l">Create your project</Typography.Title>
            <form>
                <Layout.Stack direction="column" gap="xl">
                    <div>
                        <Input.Text label="Name" placeholder="Project name" />
                        <CustomId bind:show={showCustomId} name="Project" isProject bind:id />
                    </div>
                    {#if regions}
                        <Input.Select
                            placeholder="Select a region"
                            options={regions.regions
                                .filter((region) => region.$id !== 'default')
                                .sort((regionA, regionB) => {
                                    if (regionA.disabled && !regionB.disabled) {
                                        return 1;
                                    }
                                    return regionA.name > regionB.name ? 1 : -1;
                                })
                                .map((region) => {
                                    return {
                                        label: region.name,
                                        value: region.$id,
                                        leadingHtml: `<img src='${getFlagUrl(region.flag)}' alt='Region flag'/>`,
                                        disabled: region.disabled
                                    };
                                })}
                            label="Region" />
                    {/if}
                </Layout.Stack>
            </form>
        </Layout.Stack></Card.Base>
</div>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';

    .page-container {
        width: calc(100% - 2rem);
        margin: 0 1rem;
        min-height: 100vh;
        gap: 4.5rem;

        @media #{$break2open} {
            width: 700px;
        }
    }
</style>
