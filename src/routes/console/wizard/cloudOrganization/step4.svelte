<script lang="ts">
    import { Pill } from '$lib/elements';
    import { toLocaleDate } from '$lib/helpers/date';
    import { WizardStep } from '$lib/layout';
    import { getCreditCardImage, tierToPlan } from '$lib/stores/billing';
    import { sdk } from '$lib/stores/sdk';
    import { createOrganization } from './store';

    const plan = tierToPlan($createOrganization.billingPlan);
    const collaboratorsNumber = $createOrganization?.collaborators?.length ?? 0;
    const totalExpences = plan.price + plan.collaboratorPrice * collaboratorsNumber;

    const today = new Date();
    const billingPayDate = new Date(today.getTime() + 44 * 24 * 60 * 60 * 1000);

    async function fetchCard() {
        try {
            const card = await sdk.forConsole.billing.getPaymentMethod(
                $createOrganization.paymentMethodId
            );
            console.log(card);
            return card;
        } catch (error) {
            console.log(error);
        }
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Confirm your details</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Confirm the details of your new organization and start your free trial.
    </svelte:fragment>

    <p class="body-text-1 u-bold">Organization name</p>
    <div class="u-flex u-gap-8 u-cross-center">
        <p class="text">{$createOrganization.name}</p>
        {#if $createOrganization?.id}
            <Pill>{$createOrganization.id}</Pill>
        {/if}
    </div>

    {#if $createOrganization.billingPlan !== 'tier-0'}
        <div class="u-margin-block-start-32">
            <p class="body-text-1 u-bold">Organization members</p>
            <p class="text">{collaboratorsNumber} invited</p>
        </div>
        <div class="u-margin-block-start-32">
            <p class="body-text-1 u-bold">Payment</p>
            {#await fetchCard()}
                <div class="u-flex u-margin-block-start-4">
                    <div class="loader is-small" />
                </div>
            {:then card}
                <span class="u-flex u-cross-center u-gap-8">
                    <p class="text u-bold">
                        <span class="u-capitalize">{card?.brand}</span> ending in {card?.last4}
                    </p>
                    <img
                        width="23"
                        height="16"
                        src={getCreditCardImage(card?.brand)}
                        alt={card?.brand} />
                </span>
            {/await}
        </div>
    {/if}
    <div class="box u-margin-block-start-32 u-flex u-flex-vertical u-gap-16">
        {#if $createOrganization.billingPlan !== 'tier-0'}
            <span class="u-flex u-main-space-between">
                <p class="text">{plan.name} plan</p>
                <p class="text">${plan.price}</p>
            </span>
            <span class="u-flex u-main-space-between">
                <p class="text">Invited members</p>
                <p class="text">${plan.collaboratorPrice * collaboratorsNumber}</p>
            </span>
        {/if}
        <div class="u-sep-block-start" />
        <span class="u-flex u-main-space-between">
            <p class="text">Estimated total (in USD)</p>
            <p class="text">${totalExpences}</p>
        </span>

        <p class="text u-margin-block-start-16">
            This amount and any extra usage fees will be charged on a recurring 30 day billing cycle
            after your trial period ends on <b>{toLocaleDate(billingPayDate.toString())}</b>.
        </p>
    </div>
</WizardStep>
