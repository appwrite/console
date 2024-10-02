<script lang="ts">
    import { page } from '$app/stores';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { HeaderAlert } from '$lib/layout';
    import { isCloud } from '$lib/system';
    import { upgradeURL } from '$lib/stores/billing';
    import { hideNotification } from '$lib/helpers/notifications';
    import { backupsBannerId, showPolicyAlert } from '$lib/stores/database';

    function handleClose() {
        showPolicyAlert.set(false);
        hideNotification(backupsBannerId);
    }
</script>

{#if $showPolicyAlert && isCloud && $organization?.$id && $page.url.pathname.match(/\/databases\/database-[^/]+$/)}
    {@const isFreePlan = $organization?.billingPlan === BillingPlan.FREE}

    {@const subtitle = isFreePlan
        ? 'Upgrade your plan to ensure your data stays safe with advanced backup policies'
        : 'Protect your data by quickly adding a backup policy'}

    {@const ctaText = isFreePlan ? 'Upgrade plan' : 'Add backup'}
    {@const ctaURL = isFreePlan ? $upgradeURL : `${$page.url.pathname}/backups`}

    <HeaderAlert type="warning" title="Your database is not backed up automatically">
        <svelte:fragment>{subtitle}</svelte:fragment>
        <svelte:fragment slot="buttons">
            <div class="u-flex u-gap-16">
                <Button
                    href={ctaURL}
                    secondary
                    fullWidthMobile
                    event={isFreePlan ? 'backup_banner_upgrade' : 'backup_banner_add'}>
                    <span class="text">{ctaText}</span>
                </Button>

                <Button text on:click={handleClose} event="backup_banner_close">
                    <span class="icon-x" aria-hidden="true"></span>
                </Button>
            </div>
        </svelte:fragment>
    </HeaderAlert>
{/if}
