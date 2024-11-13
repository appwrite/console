<script lang="ts">
    import { Card, Layout, Typography, Input } from '@appwrite.io/pink-svelte';
    import { CustomId } from '$lib/components/index.js';
    import type { RegionList } from '$lib/sdk/billing';
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { Flag } from '$lib/elements';
    let showCustomId = true;
    let id: string;

    let regions: RegionList;
    onMount(async () => {
        if (isCloud) {
            regions = await sdk.forConsole.billing.listRegions();
        }
    });
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
                    <Input.Select
                        options={[{ label: '🇩️Region 1', value: 'region1' }]}
                        label="Region" />
                    {#if regions}
                        ja regions! {regions.total}
                    {:else}
                        geen regions
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
