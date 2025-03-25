<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert } from '$lib/components';
    import { Button, FormList, InputDomain } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { isSelfHosted } from '$lib/system';
    import { func } from '$routes/(console)/project-[region]-[project]/functions/function-[function]/store';
    import { domain, typeStore } from './store';
    import { consoleVariables } from '$routes/(console)/store';
    import { ResourceType } from '@appwrite.io/console';
    import { page } from '$app/stores';

    let error = null;
    const isDomainsEnabled = $consoleVariables?._APP_DOMAIN_ENABLED === true;

    async function createDomain() {
        try {
            if ($domain.$id) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .proxy.deleteRule($domain.$id);
            }

            $domain = await sdk
                .forProject($page.params.region, $page.params.project)
                .proxy.createRule(
                    $domain.domain,
                    $typeStore,
                    $typeStore === ResourceType.Function ? $func.$id : undefined
                );

            trackEvent(Submit.DomainCreate);
        } catch (e) {
            error = true;
            trackError(e.message, Submit.DomainCreate);
            throw new Error(e.message);
        }
    }
</script>

<WizardStep beforeSubmit={createDomain}>
    <svelte:fragment slot="title">Domain</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Use your self-owned domain as the endpoint of your Appwrite API. <a
            href="https://appwrite.io/docs/advanced/platform/custom-domains"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Learn more</a
        >.
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
                    href="https://appwrite.io/docs/advanced/platform/custom-domains#cname-record"
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
                <Button
                    href="https://appwrite.io/docs/advanced/self-hosting/functions#git"
                    external
                    text>
                    Learn more
                </Button>
            </svelte:fragment>
        </Alert>
    {/if}
</WizardStep>
