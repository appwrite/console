<script lang="ts">
    import { Card, Layout, Typography, Input, Tag, Icon, Button } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId } from '$lib/components/index.js';
    import type { RegionList } from '$lib/sdk/billing';
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Flag, ID, Region } from '@appwrite.io/console';
    import Loading from './loading.svelte';
    import { BillingPlan } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    let showCustomId = false;
    let isLoading = false;
    let id: string;
    let startAnimation = false;
    let projectName = '';

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

    async function createProject() {
        isLoading = true;

        const org = await sdk.forConsole.billing.createOrganization(
            ID.unique(),
            'Personal Projects',
            BillingPlan.FREE,
            null,
            null
        );

        const teamId = org.$id;
        try {
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                projectName,
                teamId,
                Region.Default
            );
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId
            });

            startAnimation = true;

            setTimeout(() => {
                goto(`${base}/project-${project.$id}`);
            }, 3000);
        } catch (e) {
            // error = e.message;
            trackError(e, Submit.ProjectCreate);
            // disabled = false;
        }
    }
</script>

<div
    class="page-container u-flex-vertical u-cross-child-center u-cross-center u-margin-block-start-96">
    {#if isLoading}
        <Loading {startAnimation} />
    {:else}
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
                        <Layout.Stack direction="column" gap="s">
                            <Input.Text
                                label="Name"
                                placeholder="Project name"
                                bind:value={projectName} />
                            {#if !showCustomId}
                                <div>
                                    <Tag
                                        size="s"
                                        on:click={() => {
                                            showCustomId = true;
                                        }}><Icon icon={IconPencil} /> Project ID</Tag>
                                </div>
                            {/if}
                            <CustomId
                                bind:show={showCustomId}
                                name="Project"
                                isProject
                                bind:id
                                fullWidth={true} />
                        </Layout.Stack>
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
                        <div class="u-flex u-main-end">
                            <Button.Button
                                type="button"
                                variant="primary"
                                size="m"
                                on:click={createProject}>
                                Create</Button.Button>
                        </div>
                    </Layout.Stack>
                </form>
            </Layout.Stack></Card.Base>
    {/if}
</div>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';

    .page-container {
        width: calc(100% - 2rem);
        margin: 0 1rem;
        min-height: 100vh;
        gap: 4.5rem;
        color: var(--color-fgcolor-neutral-primary, #2d2d31);

        @media #{$break2open} {
            width: 700px;
        }
    }
</style>
