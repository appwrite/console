<script lang="ts">
    import { CustomId, LabelCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { organizationList } from '$lib/stores/organization';
    import { createOrganization } from './store';

    let showCustomId = false;

    $: anyOrgFree = $organizationList.teams?.find((org) => org?.tier === 'free');
</script>

<WizardStep>
    <svelte:fragment slot="title">Organization Details</svelte:fragment>
    <FormList>
        <InputText
            label="Name"
            id="name"
            placeholder="Organization name"
            bind:value={$createOrganization.name}
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Organization ID </span>
                </Pill>
            </div>
        {:else}
            <CustomId
                bind:show={showCustomId}
                name="Organization"
                bind:id={$createOrganization.id} />
        {/if}
    </FormList>

    <p class="body-text-1 u-bold common-section">Plan</p>
    <p class="text">
        For more details on our plans, visit our <a
            class="link"
            href="http://#"
            target="_blank"
            rel="noopener noreferrer">pricing page</a
        >.
    </p>
    <ul
        class="u-flex u-flex-vertical u-gap-16 u-margin-block-start-16"
        style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
        {#if !anyOrgFree}
            <li>
                <LabelCard name="plan" bind:group={$createOrganization.tier} value="free">
                    <svelte:fragment slot="custom">
                        <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                            <h4 class="body-text-2 u-bold">Free - $0/month</h4>
                            <p class="u-color-text-gray u-small">For personal, passion projects.</p>
                        </div>
                    </svelte:fragment>
                </LabelCard>
            </li>
        {/if}
        <li>
            <LabelCard name="plan" bind:group={$createOrganization.tier} value="starter">
                <svelte:fragment slot="custom">
                    <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                        <h4 class="body-text-2 u-bold">
                            Starter - $10/month per organization member
                        </h4>
                        <p class="u-color-text-gray u-small">
                            For small organizations that want flexibility.
                        </p>
                    </div>
                    <Pill>14 DAY FREE TRIAL</Pill>
                </svelte:fragment>
            </LabelCard>
        </li>
        <li>
            <LabelCard name="plan" bind:group={$createOrganization.tier} value="premium">
                <svelte:fragment slot="custom">
                    <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                        <h4 class="body-text-2 u-bold">
                            Pro - $20/month per organization member + exta usage
                        </h4>
                        <p class="u-color-text-gray u-small">
                            For organizations that need the ability scale easily.
                        </p>
                    </div>
                    <Pill>14 DAY FREE TRIAL</Pill>
                </svelte:fragment>
            </LabelCard>
        </li>
    </ul>
</WizardStep>
