<script>
    import Base from './base.svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '@appwrite.io/console';
    import Button from '$lib/elements/forms/button.svelte';
</script>

<Base>
    {#if isCloud}
        {#if $organization?.billingPlan !== BillingPlan.Tier0}
            <div class="u-flex-vertical u-gap-8">
                <p>
                    <span class="u-bold">Roles</span>
                    {#if $organization?.billingPlan === BillingPlan.Tier0}
                        <span class="inline-tag u-normal u-x-small">Pro plan</span>
                    {/if}
                </p>
                <p>Owner, Developer, Editor, Analyst and Billing.</p>
            </div>
            <p>
                <Button link external href="https://appwrite.io/docs/advanced/platform/roles"
                    >Learn more</Button> about roles.
            </p>
        {:else}
            <div class="u-flex-vertical u-gap-8">
                <p>
                    <span class="u-bold">Roles</span>
                    {#if $organization?.billingPlan === BillingPlan.Tier0}
                        <span class="inline-tag u-normal u-x-small">Pro plan</span>
                    {/if}
                </p>
                <p>
                    Upgrade to Pro to assign new roles to members such as Owner, Developer, Editor
                    or Analyst.
                </p>
            </div>
            <p class="u-flex u-main-end u-cross-center u-gap-4">
                <Button text external href="https://appwrite.io/docs/advanced/platform/roles"
                    >Learn more</Button>
                <Button secondary external href={$upgradeURL}>Upgrade plan</Button>
            </p>
        {/if}
    {:else}
        <div class="u-flex-vertical u-gap-8">
            <p>
                <span class="u-bold">Roles</span>
                <span class="inline-tag u-normal u-x-small">Appwrite Cloud</span>
            </p>
            <p>
                Upgrade to Cloud to assign new roles to members or ask us about our entriprise self
                hosted offering.
            </p>
        </div>
        <p class="u-flex u-main-end u-cross-center u-gap-4">
            <Button text external href="https://appwrite.io/docs/advanced/platform/roles"
                >Learn more</Button>
            <Button secondary external href={$upgradeURL}>Upgrade to Cloud</Button>
        </p>
    {/if}
</Base>
