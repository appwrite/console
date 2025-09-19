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
    import { organization } from '$lib/stores/organization';
    import type { Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import Wizard from '$lib/layout/wizard.svelte';
    import { base } from '$app/paths';
    import { writable } from 'svelte/store';
    import { getApexDomain } from '$lib/helpers/tlds';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

    let { data } = $props();

    const ruleId = page.url.searchParams.get('rule');

    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>('nameserver');
    $effect(() => {
        if ($regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME) {
            selectedTab = 'cname';
        } else if (!isCloud && $regionalConsoleVariables._APP_DOMAIN_TARGET_A) {
            selectedTab = 'a';
        } else if (!isCloud && $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA) {
            selectedTab = 'aaaa';
        } else {
            selectedTab = 'nameserver';
        }
    });
    let verified: boolean | undefined = $state(undefined);

    let routeBase = `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/domains`;
    let isSubmitting = $state(writable(false));

    async function verify() {
        try {
            if (isCloud) {
                const apexDomain = getApexDomain(data.proxyRule.domain);
                if (apexDomain) {
                    try {
                        const domainData = await sdk.forConsole.domains.create({
                            teamId: $organization.$id,
                            domain: apexDomain
                        });
                        verified = domainData.nameservers.toLowerCase() === 'appwrite';
                        if (!verified) {
                            throw new Error(
                                'Domain verification failed. Please check your domain settings or try again later'
                            );
                        }
                    } catch (error) {}

                    try {
                        const domain = data.domainsList.domains.find(
                            (d: Models.Domain) => d.domain === apexDomain
                        );
                        if (domain) {
                            const output = await sdk.forConsole.domains.updateNameservers({
                                domainId: domain.$id
                            });
                            verified = output.nameservers.toLowerCase() === 'appwrite';
                            if (!verified) {
                                throw new Error(
                                    'Domain verification failed. Please check your domain settings or try again later'
                                );
                            }
                        }
                    } catch (error) {}
                }
            }

            const ruleData = await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId });

            verified = ruleData.status === 'verified';
            if (!verified) {
                throw new Error(
                    'Domain verification failed. Please check your domain settings or try again later'
                );
            }

            addNotification({
                type: 'success',
                message: 'Domain added successfully'
            });
            await goto(routeBase);
            await invalidate(Dependencies.DOMAINS);
            await invalidate(Dependencies.FUNCTION_DOMAINS);
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
        await goto(`${routeBase}/add-domain?domain=${data.proxyRule.domain}`);
    }
</script>

<Wizard title="Add domain" href={routeBase} column columnSize="s">
    <Form onSubmit={verify} bind:isSubmitting>
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
                            {data.proxyRule.domain}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button secondary on:click={back}>Change</Button>
                </Layout.Stack>
            </Card.Base>

            <Fieldset legend="Verification">
                <Layout.Stack gap="xl">
                    <div>
                        <Tabs.Root variant="secondary" let:root>
                            {#if !!$regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME && $regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME !== 'localhost'}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'cname')}
                                    active={selectedTab === 'cname'}>
                                    CNAME
                                </Tabs.Item.Button>
                            {/if}
                            {#if isCloud}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'nameserver')}
                                    active={selectedTab === 'nameserver'}>
                                    Nameservers
                                </Tabs.Item.Button>
                            {/if}
                            {#if !isCloud && !!$regionalConsoleVariables._APP_DOMAIN_TARGET_A && $regionalConsoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'a')}
                                    active={selectedTab === 'a'}>
                                    A
                                </Tabs.Item.Button>
                            {/if}
                            {#if !isCloud && !!$regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA && $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'}
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
                            domain={data.proxyRule.domain}
                            {verified}
                            ruleStatus={data.proxyRule.status} />
                    {:else}
                        <RecordTable
                            domain={data.proxyRule.domain}
                            {verified}
                            variant={selectedTab}
                            ruleStatus={data.proxyRule.status}
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
