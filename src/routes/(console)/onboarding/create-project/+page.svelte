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
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { addNotification } from '$lib/stores/notifications';

    let showCustomId = false;
    let isLoading = false;
    let id: string;
    let startAnimation = false;
    let projectName = '';

    let regions: RegionList;
    onMount(async () => {
        if (isCloud) {
            regions = await sdk.forConsole.billing.listRegions();
            regions.regions.forEach((region) => fetch(getFlagUrl(region.flag));
        }
    });

    function getFlagUrl(countryCode: string) {
        if (!isValueOfStringEnum(Flag, countryCode)) return '';
        return sdk.forProject.avatars.getFlag(countryCode, 22, 15, 100)?.toString();
    }

    async function createProject() {
        isLoading = true;

        let org;
        try {
            org = await sdk.forConsole.billing.createOrganization(
                ID.unique(),
                'Personal projects',
                BillingPlan.FREE,
                null,
                null
            );
        } catch (e) {
            isLoading = false;
            trackError(e, Submit.OrganizationCreate);
            addNotification({
                type: 'error',
                message: e.message
            });
        }

        if (org) {
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
                trackError(e, Submit.ProjectCreate);
                isLoading = false;
                addNotification({
                    type: 'error',
                    message: e.message
                });
            }
        }
    }

    function getRegions() {
        return regions.regions
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
            });
    }
</script>

<svelte:head>
    <title>Create project - Appwrite</title>
</svelte:head>
<div
    class="page-container u-flex-vertical u-cross-child-center u-cross-center"
    class:u-margin-block-start-96={!isLoading}>
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
        <Card.Base variant="primary" padding="l"
            ><form>
                <Layout.Stack direction="column" gap="xxl">
                    <div style:margin-top="20px">
                        <Typography.Title size="l">Create your project</Typography.Title>
                    </div>

                    <Layout.Stack direction="column" gap="xxl">
                        <Layout.Stack direction="column" gap="xxl">
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
                                <Layout.Stack gap="xs"
                                    ><Input.Select
                                        placeholder="Select a region"
                                        options={getRegions()}
                                        label="Region" />
                                    <Typography.Text
                                        >Region cannot be changed after creation</Typography.Text>
                                </Layout.Stack>
                            {/if}
                        </Layout.Stack>
                    </Layout.Stack>
                    <Layout.Stack direction="row" justifyContent="flex-end"
                        ><Button.Button
                            type="button"
                            variant="primary"
                            size="m"
                            on:click={createProject}>
                            Create</Button.Button>
                    </Layout.Stack>
                </Layout.Stack>
            </form></Card.Base>
    {/if}
</div>

<style lang="scss">
    @import '@appwrite.io/pink-legacy/src/abstract/variables/_devices.scss';
    :global(body) {
        background: var(--color-bgcolor-neutral-default, #19191c);
    }
    .page-container {
        width: calc(100% - 2rem);
        margin: 0 1rem;
        gap: 4.5rem;
        background: var(--color-bgcolor-neutral-default, #19191c);

        @media #{$break2open} {
            width: 700px;
        }
    }
</style>
