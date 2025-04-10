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
    import VerificationFieldset from './verificationFieldset.svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import Wizard from '$lib/layout/wizard.svelte';
    import { base } from '$app/paths';
    import { writable } from 'svelte/store';
    import { consoleVariables } from '$routes/(console)/store';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import RecordTable from '$lib/components/domains/recordTable.svelte';

    let { data } = $props();

    const ruleId = page.url.searchParams.get('rule');
    let selectedTab: 'cname' | 'nameserver' | 'a' | 'aaaa' = $state(
        !!$consoleVariables._APP_DOMAIN_TARGET_CNAME
            ? 'cname'
            : !!$consoleVariables._APP_DOMAIN_TARGET_A
              ? 'a'
              : !!$consoleVariables._APP_DOMAIN_TARGET_AAAA
                ? 'aaaa'
                : 'nameserver'
    );
    let verified = $state(false);

    let routeBase = `${base}/project-${page.params.project}/sites/site-${page.params.site}/domains`;
    let isSubmitting = $state(writable(false));
    let isSubDomain = $derived(page.params.domain?.split('.')?.length >= 3);

    async function verify() {
        const isNewDomain =
            data.domainsList.domains.findIndex((rule) => rule.domain === page.params.domain) === -1;
        try {
            if (selectedTab !== 'nameserver') {
                const ruleData = await sdk.forProject.proxy.updateRuleVerification(ruleId);
                verified = ruleData.status === 'verified';
            } else if (isNewDomain && isCloud) {
                const domainData = await sdk.forConsole.domains.create(
                    $organization.$id,
                    page.params.domain
                );
                verified = domainData.nameservers.toLocaleLowerCase() === 'appwrite';
            }

            addNotification({
                type: 'success',
                message: 'Domain added successfully'
            });
            await goto(routeBase);
            await invalidate(Dependencies.DOMAINS);
            await invalidate(Dependencies.SITES_DOMAINS);
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
            await sdk.forProject.proxy.deleteRule(ruleId);
        }
        await goto(`${routeBase}/add-domain?domain=${page.params.domain}`);
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
                            {page.params.domain}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button secondary on:click={back}>Change</Button>
                </Layout.Stack>
            </Card.Base>

            <Fieldset legend="Verification">
                <Layout.Stack gap="xl">
                    <div>
                        <Tabs.Root variant="secondary" let:root>
                            {#if isSubDomain && !!$consoleVariables._APP_DOMAIN_TARGET_CNAME && $consoleVariables._APP_DOMAIN_TARGET_CNAME !== 'localhost'}
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
                            {#if !!$consoleVariables._APP_DOMAIN_TARGET_A && $consoleVariables._APP_DOMAIN_TARGET_A !== '127.0.0.1'}
                                <Tabs.Item.Button
                                    {root}
                                    on:click={() => (selectedTab = 'a')}
                                    active={selectedTab === 'a'}>
                                    A
                                </Tabs.Item.Button>
                            {/if}
                            {#if !!$consoleVariables._APP_DOMAIN_TARGET_AAAA && $consoleVariables._APP_DOMAIN_TARGET_AAAA !== '::1'}
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
                        <NameserverTable domain={page.params.domain} {verified} />
                    {:else}
                        <RecordTable domain={page.params.domain} {verified} variant={selectedTab} />
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
