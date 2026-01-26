<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import { BillingPlanGroup } from '@appwrite.io/console';

    export let title: string;
    export let tooltipContent =
        $organization?.billingPlanDetails.group === BillingPlanGroup.Starter
            ? `Upgrade to add more ${title.toLocaleLowerCase()}`
            : `You've reached the ${title.toLocaleLowerCase()} limit for the ${
                  $organization?.billingPlanDetails?.name
              } plan`;

    export let disabled: boolean;
    export let buttonText: string;
    export let buttonMethod: () => void | Promise<void> = () => {};
    export let buttonHref: string = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonEventData: Record<string, unknown> = {};
    export let icon = 'plus';
    export let showIcon = true;
    export let buttonType: 'primary' | 'secondary' | 'text' = 'primary';
</script>

<Tooltip disabled={!disabled}>
    <Button
        size="s"
        text={buttonType === 'text'}
        secondary={buttonType === 'secondary'}
        on:click={buttonMethod}
        event={buttonEvent}
        eventData={buttonEventData}
        {disabled}
        href={buttonHref}>
        {#if showIcon}
            <span class={`icon-${icon}`} aria-hidden="true"></span>
        {/if}
        <span class="text">{buttonText}</span>
    </Button>
    <div slot="tooltip">{tooltipContent}</div>
</Tooltip>
