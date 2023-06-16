<script lang="ts">
    import { CustomId, LabelCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createOrganization } from './store';

    let showCustomId = false;
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
        <li>
            <LabelCard name="plan" bind:group={$createOrganization.tier} value="free">
                <svelte:fragment slot="title">Free - $0/month</svelte:fragment>
                For personal, passion projects.
            </LabelCard>
        </li>
        <li>
            <LabelCard name="plan" bind:group={$createOrganization.tier} value="starter">
                <svelte:fragment slot="title"
                    >Starter - $10/month per organization member</svelte:fragment>
                For small organizations that want flexibility.
            </LabelCard>
        </li>
        <li>
            <LabelCard name="plan" bind:group={$createOrganization.tier} value="premium">
                <svelte:fragment slot="title">
                    Pro - $20/month per organization member + exta usage
                </svelte:fragment>
                For organizations that need the ability scale easily.
            </LabelCard>
        </li>
    </ul>
</WizardStep>
