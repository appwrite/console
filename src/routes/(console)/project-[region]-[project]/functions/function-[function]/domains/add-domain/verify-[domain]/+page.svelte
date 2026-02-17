<script lang="ts">
    import { IconGlobeAlt } from '@appwrite.io/pink-icons-svelte';
    import {
        Card,
        Divider,
        Fieldset,
        Icon,
        Layout,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import Wizard from '$lib/layout/wizard.svelte';
    import { base } from '$app/paths';
    import { writable } from 'svelte/store';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { getApexDomain } from '$lib/helpers/tlds.js';

    let { data } = $props();

    const ruleId = page.url.searchParams.get('rule');

    const showCNAMETab = $derived(
        Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME !== 'localhost'
    );
    const showATab = $derived(
        !isCloud &&
            Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_A) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'
    );
    const showAAAATab = $derived(
        !isCloud &&
            Boolean($regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA) &&
            $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'
    );
    const showNSTab = isCloud;

    let proxyRule = $derived(data.proxyRule);
    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>(getDefaultTab());
    let routeBase = `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/domains`;
    let verified: boolean | undefined = $state(undefined);
    const isSubmitting = writable(false);

    function getDefaultTab() {
        return showCNAMETab ? 'cname' : showATab ? 'a' : showAAAATab ? 'aaaa' : 'nameserver';
    }

    async function verify() {
        verified = undefined;

        try {
            const apexDomain = getApexDomain(proxyRule.domain);
            const domain = data.domainsList.domains.find((d) => d.domain === apexDomain);

            if (isCloud && domain) {
                await sdk.forConsole.domains.updateNameservers({
                    domainId: domain.$id
                });
            }
        } catch (error) {
            // Ignore error
        }

        try {
            proxyRule = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId });

            await Promise.all([
                invalidate(Dependencies.DOMAINS),
                invalidate(Dependencies.FUNCTION_DOMAINS)
            ]);
            await goto(routeBase);
            addNotification({
                type: 'success',
                message: 'Domain verified successfully'
            });
        } catch (error) {
            verified = false;
            isSubmitting.set(false);
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function back() {
        if (ruleId) {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.deleteRule({ ruleId });
        }
        await goto(`${routeBase}/add-domain?domain=${proxyRule.domain}`);
    }
</script>

<Wizard title="Add domain" href={routeBase} column columnSize="s">
    <Form onSubmit={verify} {isSubmitting}>
        <Layout.Stack gap="xxl">
            <Card.Base radius="s" padding="s">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Icon icon={IconGlobeAlt} color="--fgcolor-neutral-primary" />

                        <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                            {proxyRule.domain}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button secondary on:click={back}>Change</Button>
                </Layout.Stack>
            </Card.Base>

            <Fieldset legend="Verification">
                <Layout.Stack gap="xl">
                    <div>
                        <Tabs.Root variant="secondary" let:root>
                            {#if showCNAMETab}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'cname')}
                                    active={selectedTab === 'cname'}>
                                    CNAME
                                </Tabs.Item.Button>
                            {/if}
                            {#if showNSTab}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'nameserver')}
                                    active={selectedTab === 'nameserver'}>
                                    Nameservers
                                </Tabs.Item.Button>
                            {/if}
                            {#if showATab}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'a')}
                                    active={selectedTab === 'a'}>
                                    A
                                </Tabs.Item.Button>
                            {/if}
                            {#if showAAAATab}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'aaaa')}
                                    active={selectedTab === 'aaaa'}>
                                    AAAA
                                </Tabs.Item.Button>
                            {/if}
                        </Tabs.Root>
                        <Divider />
                    </div>
                    {#if selectedTab === 'nameserver'}
                        <NameserverTable
                            {verified}
                            domain={proxyRule.domain}
                            ruleStatus={proxyRule.status} />
                    {:else}
                        <RecordTable
                            {verified}
                            service="functions"
                            variant={selectedTab}
                            domain={proxyRule.domain}
                            ruleStatus={proxyRule.status}
                            onNavigateToNameservers={() => (selectedTab = 'nameserver')}
                            onNavigateToA={() => (selectedTab = 'a')}
                            onNavigateToAAAA={() => (selectedTab = 'aaaa')} />
                    {/if}
                    <Divider />
                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <div>
                            <Button submit disabled={$isSubmitting}>Verify</Button>
                        </div>
                    </Layout.Stack>
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>
</Wizard>
