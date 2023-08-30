<script lang="ts">
    import { newOrgModal, newMemberModal, organization } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
    import { isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDate } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { registerCommands } from '$lib/commandCenter';
    import { requestedMigration } from '$routes/store';
    import { openMigrationWizard } from '../(migration-wizard)';

    onMount(() => {
        if (isCloud) {
            checkForTrialEnding();
            paymentExpired();
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

    //TODO: move this function
    async function paymentExpired() {
        if (localStorage.getItem('paymentExpiredNotification') === 'true') return;
        const payment = await sdk.forConsole.billing.getPaymentMethod(
            $organization.paymentMethodId
        );

        if (payment.expired) {
            addNotification({
                type: 'info',
                isHtml: true,
                dismissible: false,
                message: `The default payment method for <b>${$organization.name}</b> has expired`,
                buttons: [
                    {
                        name: 'Update payment details',
                        method: () => {
                            goto(`${base}/console/account/payments`);
                        }
                    }
                ]
            });
            localStorage.setItem('paymentExpiredNotification', 'true');
        }
    }

    export let data;

    $: if ($requestedMigration) {
        openMigrationWizard();
    }

    $: $registerCommands([
        {
            label: 'Go to members',
            callback: () => {
                goto(`/console/organization-${data.organization.$id}/members`);
            },
            keys: ['g', 'm'],
            disabled: $page.url.pathname.endsWith('/members'),
            group: 'navigation'
        },
        {
            label: 'Go to settings',
            callback: () => {
                goto(`/console/organization-${data.organization.$id}/settings`);
            },
            keys: ['g', 's'],
            disabled: $page.url.pathname.endsWith('/settings'),
            group: 'navigation'
        }
    ]);
</script>

<svelte:head>
    <title>Organizations - Appwrite</title>
</svelte:head>

<slot />

<Create bind:show={$newOrgModal} />
<CreateMember bind:showCreate={$newMemberModal} />
