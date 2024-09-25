<script>
    import Base from './base.svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
</script>

<Base>
    {#if isCloud}
        <p>
            <span class="u-bold">Roles</span>
            {#if $organization?.billingPlan === BillingPlan.FREE}
                <span class="inline-tag u-normal u-x-small">Pro plan</span>
            {/if}
        </p>
        {#if $organization?.billingPlan !== BillingPlan.FREE}
            <p>
                Owner, Developer <span class="inline-tag u-normal u-x-small">Default</span>, Editor,
                Analyst, Billing.
            </p>
            <p>
                <Button link external href="https://appwrite.io/docs/roles">Learn more</Button> about
                roles.
            </p>
        {:else}
            <p>
                Owner, <span class="u-color-text-disabled">Developer, Editor, Analyst.</span>
            </p>
            <p class="u-flex u-main-end u-cross-center u-gap-12">
                <Button text link external href="https://appwrite.io/docs/roles">Learn more</Button>
                <a class="button is-secondary" href={$upgradeURL}>Upgrade plan</a>
            </p>
        {/if}
    {:else}
        <p>
            <span class="u-bold">Roles</span>
            <span class="inline-tag u-normal u-x-small">Appwrite Cloud</span>
        </p>
        <p>
            Upgrade to Cloud to assign new roles to members or ask us about our entriprise self
            hosted offering.
        </p>
        <p class="u-flex u-main-end u-cross-center u-gap-12">
            <Button text link external href="https://appwrite.io/docs/roles">Learn more</Button>
            <Button secondary link external href={$upgradeURL}>Upgrade to Cloud</Button>
        </p>
    {/if}
</Base>
