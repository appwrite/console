<script lang="ts">
    import { tierToPlan, type Tier } from '$lib/stores/billing';
    import { tooltip } from '$lib/actions/tooltip';
    import { Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { organization } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { tick } from 'svelte';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';

    export let title: string;

    let tooltipContent: HTMLDivElement;

    // TODO: fix limit
    const limit = 1000;

    $: tier = tierToPlan($organization?.billingPlan as Tier)?.name;
</script>

<div class="u-flex u-gap-12 common-section u-main-space-between">
    <div class="u-flex u-cross-child-center u-gap-16">
        <Heading tag="h2" size="5">{title}</Heading>
        {#if isCloud}
            <div
                use:tooltip={{
                    interactive: true,
                    allowHTML: true,
                    trigger: 'click',
                    onShow(instance) {
                        tick().then(() => {
                            instance.setContent(tooltipContent);
                        });
                    }
                }}>
                <Pill button>
                    <span class="icon-info" />{title} limited
                </Pill>
            </div>
        {/if}
    </div>

    <slot />
</div>

{#if isCloud}
    <div class="u-hide">
        <div bind:this={tooltipContent}>
            <p class="text">
                Your are limited to {limit}
                {title.toLocaleLowerCase()} per project on the {tier}.
            </p>
            <button
                class="link"
                type="button"
                on:click|preventDefault={() => wizard.start(ChangeOrganizationTierCloud)}
                >Upgrade</button>
            for addtional {title.toLocaleLowerCase()}.
        </div>
    </div>
{/if}
