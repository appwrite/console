<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { DropList } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';

    export let isFlex = true;
    export let title: string;

    export let buttonText: string = null;
    export let hasLimitations: boolean = true;
    export let buttonMethod: () => void = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonDisabled = false;
    export let buttonType: 'primary' | 'secondary' | 'text' = 'primary';

    let showDropdown = false;
</script>

<header
    class:is-disabled={buttonDisabled}
    class:u-flex={isFlex}
    class="u-gap-12 common-section u-main-space-between u-flex-wrap">
    <div class="u-flex u-cross-child-center u-cross-center u-gap-12">
        <div class="body-text-1 u-bold backups-title">{title}</div>

        {#if hasLimitations && $organization.billingPlan === BillingPlan.PRO}
            <div style="height: 40px; padding-block-start: 4px">
                <DropList bind:show={showDropdown} width="16">
                    <Pill button on:click={() => (showDropdown = true)}>
                        <span class="icon-info" />1/1 created
                    </Pill>
                    <svelte:fragment slot="list">
                        <slot name="tooltip">
                            <span>
                                You are limited to one policy on Pro plan.
                                <button
                                    class="u-underline"
                                    on:click={() => {
                                        showDropdown = !showDropdown;
                                        wizard.start(SupportWizard);
                                    }}>Contact support</button> to upgrade your plan and add customized
                                backup policies.
                            </span>
                        </slot>
                    </svelte:fragment>
                </DropList>
            </div>
        {/if}
    </div>

    {#if !hasLimitations}
        <Button
            event={buttonEvent}
            on:click={hasLimitations
                ? () => {
                      showDropdown = true;
                  }
                : buttonMethod}
            disabled={buttonDisabled}
            text={buttonType === 'text'}
            secondary={buttonType === 'secondary'}>
            <span class="icon-plus" aria-hidden="true" />
            {buttonText}
        </Button>
    {/if}
</header>

<style>
    .is-disabled {
        opacity: 0.5;
    }

    :global(.theme-light) .backups-title {
        --p-body-text-color: #373b4d;
        color: var(--p-body-text-color);
    }

    :global(.theme-dark) .backups-title {
        color: hsl(var(--color-neutral-5));
    }

    :global(.small-radius-border-button) {
        border-radius: var(--border-radius-small) !important;
    }
</style>
