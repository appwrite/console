<script lang="ts">
    import SvgIcon from '$lib/components/svgIcon.svelte';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { data, type Provider } from '.';

    const providers: Record<Provider, string> = {
        appwrite: 'Appwrite',
        firebase: 'Firebase',
        supabase: 'Supabase',
        nhost: 'NHost'
    };

    let showAuth = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Choose provider</svelte:fragment>
    <div class="cards">
        {#each Object.entries(providers) as [key, value]}
            <label
                class="card is-allow-focus u-height-100-percent u-flex u-flex-vertical u-cursor-pointer">
                <input
                    class="is-small"
                    type="radio"
                    name="provider"
                    bind:group={$data.provider}
                    value={key} />
                <div class="content">
                    <img src="/logos/{key}.png" width="33" class="u-margin-inline-auto" alt="" />
                    <p>{value}</p>
                </div>
            </label>
        {/each}
    </div>

    {#if $data.provider === 'appwrite'}
        <FormList class="u-margin-block-start-24">
            <InputText
                id="endpoint"
                label="Endpoint"
                required
                placeholder="Enter endpoint"
                bind:value={$data.inputs.appwrite.endpoint} />
            <InputText
                id="project-id"
                label="Project ID"
                required
                placeholder="Enter project ID"
                bind:value={$data.inputs.appwrite.projectID} />
            <InputText
                id="api-key"
                label="API Key"
                placeholder="Enter API Key"
                bind:value={$data.inputs.appwrite.apiKey} />
        </FormList>
    {:else if $data.provider === 'firebase'}
        <div class="box u-flex u-flex-vertical u-gap-16 u-cross-center u-margin-block-start-24">
            <p class="u-text-center u-bold">Sign in with Google to get started</p>
            <Button secondary>
                <SvgIcon name="google" />Sign in
            </Button>
        </div>

        <button
            class="tag u-margin-block-start-16"
            type="button"
            on:click={() => (showAuth = !showAuth)}
            class:is-selected={showAuth}>
            <span class="icon-lock-closed" aria-hidden="true" />
            <span class="text">Manual authentication</span>
        </button>

        {#if showAuth}
            <div class="u-margin-block-start-16">
                <InputText
                    id="credentials"
                    label="Account credentials"
                    required
                    placeholder="TODO" />
            </div>
        {/if}
    {/if}
</WizardStep>

<style lang="scss">
    .cards {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .card {
        --card-padding: 2.5rem 0.5rem;
        --card-border-radius: var(--border-radius-small);
        display: block;

        position: relative;

        input {
            position: absolute;
            top: 0.5rem;
            left: 0.5rem;
        }

        .content {
            width: 9.125rem;
            height: 4rem;

            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
        }
    }
</style>
