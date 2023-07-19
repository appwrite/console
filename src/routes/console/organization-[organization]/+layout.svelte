<script lang="ts">
    import { newOrgModal, newMemberModal, organization } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
    import { isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDate } from '$lib/helpers/date';

    onMount(() => {
        if (isCloud) {
            checkForTrialEnding();
        }
    });

    function checkForTrialEnding() {
        if (localStorage.getItem('trialEndingNotification') === 'true') return;
        if ($organization?.billingTrialDays === 5) {
            const expirationDate = new Date(
                new Date().getTime() + 5 * 24 * 60 * 60 * 1000
            ).toString();
            addNotification({
                type: 'info',
                isHtml: true,
                message: `<b>We hope you've been enjoying the Pro plan.</b>
                You will be billed on a recurring 30 day cycle after your trial period ends on <b>${toLocaleDate(
                    expirationDate
                )}</b>`
            });
            localStorage.setItem('trialEndingNotification', 'true');
        }
    }
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

<slot />

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
