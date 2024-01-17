<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';

    export let title: string;
    export let tooltipContent =
        $organization.billingPlan === BillingPlan.STARTER
            ? `Upgrade to add more ${title.toLocaleLowerCase()}`
            : `You've reached the ${title.toLocaleLowerCase()} limit for the ${
                  tierToPlan($organization.billingPlan).name
              } plan`;
    export let disabled: boolean;
    export let buttonText: string;
    export let buttonMethod: () => void | Promise<void>;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let icon = 'plus';
    export let showIcon = true;
    export let buttonType: 'primary' | 'secondary' | 'text' = 'primary';
</script>

<div
    use:tooltip={{
        content: tooltipContent,
        disabled: !disabled
    }}>
    <Button
        text={buttonType === 'text'}
        secondary={buttonType === 'secondary'}
        on:click={buttonMethod}
        event={buttonEvent}
        {disabled}>
        {#if showIcon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
        <span class="text">{buttonText}</span>
    </Button>
</div>
