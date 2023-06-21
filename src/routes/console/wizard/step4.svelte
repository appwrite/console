<script lang="ts">
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { createOrganization } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Confirm your details</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Confirm the details of your new organization and start your free trial.
    </svelte:fragment>

    <p class="body-text-1 u-bold">Organization name</p>
    <div class="u-flex u-gap-8 u-cross-center">
        <p class="text">{$createOrganization.name}</p>
        {#if $createOrganization?.id}
            <Pill>{$createOrganization.id}</Pill>
        {/if}
    </div>

    <div class="u-margin-block-start-32">
        <p class="body-text-1 u-bold">Organization members</p>
        <p class="text">{$createOrganization?.collaborators?.length ?? 0} invited</p>
    </div>
    <div class="u-margin-block-start-32">
        <p class="body-text-1 u-bold">Payment</p>
        <p class="text">{$createOrganization.payment}</p>
    </div>

    <div class="box u-margin-block-start-32">
        <p class="text">{$createOrganization.tier} plan</p>
        <p class="text">Invited members</p>
        <p class="text">Credit added</p>
        <div class="u-sep-block-start" />
        <p class="text">Estimated total</p>

        <p class="text">
            This amount and any extra usage fees will be charged on a recurring 30 day billing cycle
            after your trial period ends on DATE
        </p>
    </div>
</WizardStep>
