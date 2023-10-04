<script lang="ts">
    import { newOrgModal, newMemberModal, organization } from '$lib/stores/organization';
    import CreateMember from './createMember.svelte';
    import Create from '../createOrganization.svelte';
    import { isCloud } from '$lib/system';
    import { addNotification, notifications } from '$lib/stores/notifications';
    import { toLocaleDate } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { registerCommands } from '$lib/commandCenter';
    import { requestedMigration } from '$routes/store';
    import { openMigrationWizard } from '../(migration-wizard)';

    organization.subscribe(() => {
        if (isCloud) {
            checkForTrialEnding();
            paymentExpired();
        }
    });

    function checkForTrialEnding() {
        if (
            localStorage.getItem('trialEndingNotification') === 'true' &&
            $organization?.billingTrialDays
        )
            return;
        if ($organization?.billingTrialDays >= 5) {
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
        if (!$organization?.paymentMethodId) return;
        const payment = await sdk.forConsole.billing.getPaymentMethod(
            $organization.paymentMethodId
        );
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const expiredMessage = `The default payment method for <b>${$organization.name}</b> has expired`;
        const expiringMessage = `The default payment method for <b>${$organization.name}</b> will expire soon`;
        const expiredNotification = $notifications.some((n) => n.message === expiredMessage);
        const expiringNotification = $notifications.some((n) => n.message === expiringMessage);
        if (payment.expired && !expiredNotification) {
            addNotification({
                type: 'error',
                isHtml: true,
                timeout: 0,
                message: expiredMessage,
                buttons: [
                    {
                        name: 'Update payment details',
                        method: () => {
                            goto(`${base}/console/account/payments`);
                        }
                    }
                ]
            });
        } else if (
            !expiringNotification &&
            (payment.expiryYear < year ||
                (payment.expiryYear === year && payment.expiryMonth < month))
        ) {
            addNotification({
                type: 'warning',
                isHtml: true,
                message: expiringMessage,
                buttons: [
                    {
                        name: 'Update payment details',
                        method: () => {
                            goto(`${base}/console/account/payments`);
                        }
                    }
                ]
            });
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
