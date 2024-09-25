<script>
    import Base from './base.svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
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
                <a
                    class="link"
                    href="http://appwrite.io/docs/roles"
                    target="_blank"
                    rel="noopener noreferrer">Learn more</a> about roles.
            </p>
        {:else}
            <p>
                Owner, <span class="u-color-text-disabled">Developer, Editor, Analyst.</span>
            </p>
            <p class="u-flex u-main-end u-cross-center u-gap-12">
                <a
                    class="button is-text"
                    href="http://appwrite.io/docs/roles"
                    target="_blank"
                    rel="noopener noreferrer">Learn more</a>
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
            <a
                class="button is-text"
                href="http://appwrite.io/docs/roles"
                target="_blank"
                rel="noopener noreferrer">Learn more</a>
            <a class="button is-secondary" href="https://cloud.appwrite.io">Upgrade to Cloud</a>
        </p>
    {/if}
</Base>
