<script lang="ts">
    import { page } from '$app/state';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import { reconnectGithubIdentity } from '$lib/helpers/github';
    import { HeaderAlert } from '$lib/layout';
    import {
        getChangePlanUrl,
        getProgramMembershipUnverifiedSince,
        hideBillingHeaderRoutes,
        programMembershipInvalid,
        programMembershipUnverified,
        teamStatusReadonly
    } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';

    const isRestricted = $derived($organization?.status === teamStatusReadonly);

    // GitHub confirmed the account is no longer a student, so reconnecting can't help.
    const isInvalid = $derived(isRestricted && $organization?.remarks === programMembershipInvalid);
    const isUnverified = $derived(
        isRestricted && $organization?.remarks === programMembershipUnverified
    );
    const isWarning = $derived(
        !isRestricted && !!getProgramMembershipUnverifiedSince($organization)
    );

    const show = $derived(
        !!$organization?.$id &&
            !hideBillingHeaderRoutes.includes(page.url.pathname) &&
            (isInvalid || isUnverified || isWarning)
    );

    function onReconnect() {
        trackEvent(Click.OrganizationProgramMembershipReconnect, {
            source: isWarning ? 'program_membership_warning' : 'program_membership_restricted'
        });
        reconnectGithubIdentity();
    }
</script>

{#if show}
    {#if isInvalid}
        <HeaderAlert type="error" title="Access restricted">
            GitHub is no longer confirming student status for <b>{$organization.name}</b>, so this
            organization is no longer eligible for the Appwrite Education Program and its access to
            resources has been restricted. Choose a plan to restore access.
            <svelte:fragment slot="buttons">
                <Button secondary fullWidthMobile href={getChangePlanUrl($organization.$id)}>
                    <span class="text">View plans</span>
                </Button>
            </svelte:fragment>
        </HeaderAlert>
    {:else if isUnverified}
        <HeaderAlert type="error" title="Access restricted">
            We couldn’t verify the Appwrite Education Program membership for <b
                >{$organization.name}</b>
            because its GitHub connection expired or was disconnected, so access to resources has been
            restricted. Reconnect GitHub to restore access.
            <svelte:fragment slot="buttons">
                <Button secondary fullWidthMobile on:click={onReconnect}>
                    <span class="text">Reconnect GitHub</span>
                </Button>
            </svelte:fragment>
        </HeaderAlert>
    {:else}
        <HeaderAlert type="warning" title="Reconnect GitHub to keep your education plan">
            We can’t verify the Appwrite Education Program membership for <b
                >{$organization.name}</b>
            because its GitHub connection expired or was disconnected. Reconnect GitHub to keep this organization
            on its current plan — if the connection isn’t restored, access to resources will be restricted.
            <svelte:fragment slot="buttons">
                <Button secondary fullWidthMobile on:click={onReconnect}>
                    <span class="text">Reconnect GitHub</span>
                </Button>
            </svelte:fragment>
        </HeaderAlert>
    {/if}
{/if}
