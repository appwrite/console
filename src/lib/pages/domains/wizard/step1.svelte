<script lang="ts">
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { FormList, InputDomain } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { func } from '$routes/console/project-[project]/functions/function-[function]/store';
    import { ProxyTypes } from '../index.svelte';
    import { domain, typeStore } from './store';

    async function createDomain() {
        if ($domain.$id) {
            await sdk.forProject.proxy.deleteRule($domain.$id);
        }

        $domain = await sdk.forProject.proxy.createRule(
            $domain.domain,
            $typeStore,
            $typeStore === ProxyTypes.FUNCTION ? $func.$id : undefined
        );

        trackEvent(Submit.DomainCreate);
    }
</script>

<WizardStep beforeSubmit={createDomain}>
    <svelte:fragment slot="title">Add your domain</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Use your self-owned domain as the endpoint of your Appwrite API.
    </svelte:fragment>

    <FormList>
        <InputDomain
            id="domain"
            label="Domain"
            placeholder="appwrite.example.com"
            autocomplete={false}
            required
            bind:value={$domain.domain} />
    </FormList>
    <div class="common-section">
        <p>
            You can find a list of domain providers and their DNS setting documentation <a
                class="link"
                href="https://appwrite.io/docs/custom-domains#addCNAME"
                target="_blank"
                rel="noreferrer">here</a
            >. If your domain provider isn't listed, please contact us, and we'll include their
            settings as well.
        </p>
    </div>
</WizardStep>
