<script lang="ts">
    import { Box, ModalSideCol } from '$lib/components';
    import SideLight from './side-light.png';
    import SideDark from './side-dark.png';
    import { app } from '$lib/stores/app';
    import { Button, FormList } from '$lib/elements/forms';
    import { trackEvent } from '$lib/actions/analytics';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '../changeOrganizationTierCloud.svelte';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import type { Organization } from '$lib/stores/organization';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';

    export let show = false;
    let orgs: { teams: Organization[]; total: number };
    let selectedOrg: string;

    onMount(async () => {
        orgs = (await sdk.forConsole.teams.list()) as { teams: Organization[]; total: number };
    });

    async function handleUpgrade() {
        if (selectedOrg) {
            await goto(`${base}/console/organization/${selectedOrg}/billing`);
        } else {
            const freeOrg = orgs.teams.find((o) => o.billingPlan === 'tier-0');
            await goto(`${base}/console/organization/${freeOrg.$id}/billing`);
        }
        show = false;
        wizard.start(ChangeOrganizationTierCloud);
        trackEvent('click_organization_upgrade', {
            source: event
        });
    }

    $: isNewUser = new Date($user.$createdAt) > new Date(2023, 11, 19);
    //user creation date after the 19th of December 2023
    $: event = isNewUser ? 'billing_new_user_modal' : 'billing_release_modal';
    $: freeOrgs = orgs?.teams?.filter((o) => o.billingPlan === 'tier-0');
    $: options = freeOrgs?.map((o) => ({ label: o.name, value: o.$id }));
</script>

<ModalSideCol bind:show title="Claim your Pro credit today" style="max-width: min(53rem,95%)">
    <svelte:fragment slot="side">
        {#if $app.themeInUse === 'dark'}
            <img
                src={SideDark}
                style="object-fit: cover; object-position: 30% 100%; height: 100%; width: 100%; aspect-ratio: 1 / 1;"
                alt="appwrite pro"
                aria-hidden="true"
                width="376" />
        {:else}
            <img
                src={SideLight}
                style="object-fit: cover; object-position: 30% 100%; height: 100%; width: 100%; aspect-ratio: 1 / 1;"
                alt="appwrite pro"
                aria-hidden="true"
                width="376" />
        {/if}
    </svelte:fragment>

    <div class="u-flex u-flex-vertical u-gap-16">
        <p class="text">
            Upgrade now and use the code <span class="inline-tag"
                >{isNewUser ? 'PRO15' : 'THANKYOU30'}</span>
            to claim ${isNewUser ? '15' : '30'} in credits for a Pro plan. Credits will expire on 31
            January 2024.
        </p>
    </div>
    <Box>
        <b class="body-text-1">Pro: $15 per member per billing period</b>

        <p class="u-margin-block-start-8">
            For pro developers and teams that need to scale their products. <Button
                link
                href="http://appwrite.io/pricing"
                external
                on:click={() => {
                    trackEvent('click_open_pricing', {
                        source: event
                    });
                }}>Learn more on our pricing page.</Button>
        </p>

        {#if freeOrgs?.length > 1 && options?.length}
            <FormList class="u-margin-block-start-24">
                <InputSelect
                    label="Organization to upgrade"
                    placeholder="Select organization"
                    id="orgs"
                    bind:value={selectedOrg}
                    {options} />
            </FormList>
        {:else}
            <ul class="list u-flex-vertical u-gap-8 u-margin-block-start-24">
                <li class="u-flex u-gap-8 u-cross-center">
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">Unlimited org. members</span>
                </li>
                <li class="u-flex u-gap-8 u-cross-center">
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">300GB bandwidth</span>
                </li>
                <li class="u-flex u-gap-8 u-cross-center">
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">200,000 monthly active users</span>
                </li>
                <li class="u-flex u-gap-8 u-cross-center">
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">150GB free strorage</span>
                </li>
                <li class="u-flex u-gap-8 u-cross-center">
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">7 days rolling logs</span>
                </li>
                <li class="u-flex u-gap-8 u-cross-center">
                    <span class="icon-check-circle" aria-hidden="true" />
                    <span class="text">Email support</span>
                </li>
            </ul>
        {/if}
        <Button fullWidth class="u-margin-block-start-24" on:click={handleUpgrade}>
            Start your 14 day free trial
        </Button>
    </Box>
</ModalSideCol>
