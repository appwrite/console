<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert } from '$lib/components';
    import { Button, FormList, InputDomain } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { isSelfHosted } from '$lib/system';
    import { func } from '$routes/console/project-[project]/functions/function-[function]/store';
    import { onMount } from 'svelte';
    import { ProxyTypes } from '../index.svelte';
    import { domain, typeStore } from './store';

    let error = null;
    let isDomainsEnabled = false;

    onMount(async () => {
        if (!isSelfHosted) {
            return;
        }
        const vars = await sdk.forConsole.console.variables();
        //@ts-expect-error needs an sdk release
        isDomainsEnabled = vars?._APP_DOMAIN_ENABLED === true;
    });

    async function createDomain() {
        try {
            if ($domain.$id) {
                await sdk.forProject.proxy.deleteRule($domain.$id);
            }

            $domain = await sdk.forProject.proxy.createRule(
                $domain.domain,
                $typeStore,
                $typeStore === ProxyTypes.FUNCTION ? $func.$id : undefined
            );

            trackEvent(Submit.DomainCreate);
        } catch (e) {
            error = true;
            trackError(e.message, Submit.DomainCreate);
        }
    }
</script>

<WizardStep beforeSubmit={createDomain}>
    <svelte:fragment slot="title">Add function domain</svelte:fragment>
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
    {#if error}
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
    {/if}
    {#if isSelfHosted && !isDomainsEnabled}
        <Alert class="common-section" type="info">
            <svelte:fragment slot="title">
                Adding a domain to a self-hosted instance
            </svelte:fragment>
            To add a domain to a locally hosted Appwrite project, you must first configure your server
            domain.
            <svelte:fragment slot="buttons">
                <!-- TODO: add link to docs -->
                <Button href="#/" external text>Learn more</Button>
            </svelte:fragment>
        </Alert>
    {/if}
</WizardStep>
