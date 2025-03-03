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
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { addNotification } from '$lib/stores/notifications';
    import { tierToPlan } from '$lib/stores/billing';

    let showCustomId = false;
    let isLoading = false;
    let id: string;
    let startAnimation = false;
    let projectName = '';
    export let data: { regions: RegionList | null };

    onMount(() => {
        if (isCloud) {
            if (data.regions) {
                data.regions.regions.forEach((region) => fetch(getFlagUrl(region.flag)));
            }
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
            org = isCloud
                ? await sdk.forConsole.billing.createOrganization(
                      ID.unique(),
                      'Personal projects',
                      BillingPlan.FREE,
                      null,
                      null
                  )
                : await sdk.forConsole.teams.create(ID.unique(), 'Personal projects');
        } catch (e) {
            isLoading = false;
            trackError(e, Submit.OrganizationCreate);
            addNotification({
                type: 'error',
                message: e.message
            });
        }

        trackEvent(Submit.OrganizationCreate, {
            plan: tierToPlan(BillingPlan.FREE)?.name,
            budget_cap_enabled: false,
            members_invited: 0
        });

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

                trackEvent(Submit.ProjectCreate, {
                    teamId: teamId
                });

                setTimeout(async () => {
                    await invalidate(Dependencies.ACCOUNT);
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
        if (!data.regions) {
            return;
        }
        return data.regions.regions
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
                                    required
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
                            {#if data.regions}
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
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    :global(body) {
        background: var(--bgcolor-neutral-default, #19191c);
    }
    .page-container {
        width: calc(100% - 2rem);
        margin: 0 1rem;
        gap: 4.5rem;
        background: var(--bgcolor-neutral-default, #19191c);

        @media #{devices.$break2open} {
            width: 700px;
        }
    }
</style>
