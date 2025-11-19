<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button, Form, InputDomain, InputSelect, InputURL } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { RuleTrigger, RuleType, sdk } from '$lib/stores/sdk';
    import {
        Fieldset,
        Layout,
        Tooltip,
        Icon,
        Input,
        Alert,
        Skeleton
    } from '@appwrite.io/pink-svelte';
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { LabelCard } from '$lib/components';
    import { sortBranches } from '$lib/stores/vcs';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import {
        Adapter,
        BuildRuntime,
        Framework,
        type Models,
        ProxyResourceType,
        Query,
        StatusCode
    } from '@appwrite.io/console';
    import { statusCodeOptions } from '$lib/stores/domains';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import {
        project,
        regionalConsoleVariables
    } from '$routes/(console)/project-[region]-[project]/store';
    import { isCloud } from '$lib/system';
    import { getApexDomain } from '$lib/helpers/tlds';
    import { organization } from '$lib/stores/organization';

    let {
        siteId,
        onDomainAdded,
        show = $bindable(false)
    }: {
        show: boolean;
        siteId: string;
        onDomainAdded: (rule: string, domain: Models.Domain, verified: boolean) => void;
    } = $props();

    let formComponent: Form;
    let domainName = $state('');

    let rules = $state<Models.ProxyRuleList | null>(null);
    let domains = $state<Models.DomainsList | null>(null);

    let loading = $state(true);
    let isSubmitting = $state(writable(false));

    async function loadRules() {
        try {
            rules = await sdk.forProject(page.params.region, page.params.project).proxy.listRules({
                queries: [
                    Query.equal('type', RuleType.DEPLOYMENT),
                    Query.equal('trigger', RuleTrigger.MANUAL)
                ]
            });
        } catch (error) {
            show = false;
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function loadDomains() {
        try {
            domains = await sdk.forConsole.domains.list({
                queries: [Query.equal('teamId', $organization.$id)]
            });
        } catch (error) {
            show = false;
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function addDomain() {
        const apexDomain = getApexDomain(domainName);
        let domain = domains?.domains.find((d: Models.Domain) => d.domain === apexDomain);

        const isSiteDomain = domainName.endsWith($regionalConsoleVariables._APP_DOMAIN_SITES);

        if (isCloud && apexDomain && !domain && !isSiteDomain) {
            try {
                domain = await sdk.forConsole.domains.create({
                    teamId: $project.teamId,
                    domain: apexDomain
                });
            } catch (error) {
                // apex might already be added on organization level, skip.
                const alreadyAdded = error?.type === 'domain_already_exists';
                if (!alreadyAdded) {
                    addNotification({
                        type: 'error',
                        message: error.message
                    });
                    return;
                }
            }
        }

        try {
            const rule = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.createSiteRule({
                    domain: domainName,
                    siteId
                });

            const verified = rule?.status === 'verified';
            onDomainAdded(rule.$id, domain, verified);
            if (verified) await invalidate(Dependencies.SITES_DOMAINS);

            show = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    $effect(() => {
        if (show) {
            loading = true;
            Promise.all([loadRules(), loadDomains()]).then(() => {
                loading = false;
            });
        } else {
            rules = null;
            domains = null;
            loading = false;
            domainName = null;
        }
    });
</script>

{#if show}
    <Wizard title="Add domain" column columnSize="s" confirmExit onExit={() => (show = false)}>
        <Form bind:this={formComponent} onSubmit={addDomain} bind:isSubmitting>
            <Fieldset legend="Domain">
                {#if loading}
                    <Layout.Stack gap="s">
                        <Skeleton variant="line" height={20} width="10%" />
                        <Skeleton variant="line" height={32} width="100%" />
                    </Layout.Stack>
                {:else}
                    <InputDomain
                        required
                        id="domain"
                        label="Domain"
                        bind:value={domainName}
                        placeholder="appwrite.example.com" />
                {/if}
            </Fieldset>
        </Form>

        <svelte:fragment slot="footer">
            {#if !loading}
                <Button secondary on:click={() => (show = false)}>Cancel</Button>
                <Button
                    forceShowLoader
                    bind:disabled={$isSubmitting}
                    submissionLoader={$isSubmitting}
                    on:click={() => formComponent.triggerSubmit()}>
                    Add
                </Button>
            {/if}
        </svelte:fragment>
    </Wizard>
{/if}
