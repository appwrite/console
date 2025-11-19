<script lang="ts">
    import { IconGlobeAlt } from '@appwrite.io/pink-icons-svelte';
    import {
        Card,
        Divider,
        Fieldset,
        Icon,
        Layout,
        Skeleton,
        Table,
        Tabs,
        Typography
    } from '@appwrite.io/pink-svelte';
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
    import { isASubdomain } from '$lib/helpers/tlds';
    import RecordTable from '$lib/components/domains/recordTable.svelte';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { type Models, Query } from '@appwrite.io/console';

    let {
        rule,
        domain,
        onChangeDomain,
        show = $bindable(false)
    }: {
        show: boolean;
        rule: string;
        domain: Models.Domain;
        onChangeDomain: () => void;
    } = $props();

    const isSubDomain = $derived.by(() => isASubdomain(domain?.domain));

    let verified = $state(false);
    let isSubmitting = $state(writable(false));
    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>('nameserver');

    async function verify() {
        try {
            if (selectedTab !== 'nameserver') {
                const ruleData = await sdk
                    .forProject(page.params.region, page.params.project)
                    .proxy.updateRuleVerification({ ruleId: rule });

                verified = ruleData.status === 'verified';
                throw new Error(
                    'Domain verification failed. Please check your domain settings or try again later'
                );
            } else if (isCloud) {
                const domainData = await sdk.forConsole.domains.get({
                    domainId: domain.$id
                });

                verified = domainData.nameservers.toLowerCase() === 'appwrite';
                throw new Error(
                    'Domain verification failed. Please check your domain settings or try again later'
                );
            }

            addNotification({
                type: 'success',
                message: 'Domain added successfully'
            });

            show = false;
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

    async function changeDomain() {
        if (rule) {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.deleteRule({ ruleId: rule });
        }

        show = false;
        onChangeDomain();
    }

    $effect(() => {
        if ($regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME && isSubDomain) {
            selectedTab = 'cname';
        } else if (!isCloud && $regionalConsoleVariables._APP_DOMAIN_TARGET_A) {
            selectedTab = 'a';
        } else if (!isCloud && $regionalConsoleVariables._APP_DOMAIN_TARGET_AAAA) {
            selectedTab = 'aaaa';
        } else {
            selectedTab = 'nameserver';
        }
    });
</script>

{#if show}
    <Wizard column columnSize="s" title="Add domain" onExit={() => (show = false)}>
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
                                {domain?.domain}
                            </Typography.Text>
                        </Layout.Stack>
                        <Button secondary on:click={changeDomain}>Change</Button>
                    </Layout.Stack>
                </Card.Base>

                <Fieldset legend="Verification">
                    <Layout.Stack gap="xl">
                        <div>
                            <Tabs.Root variant="secondary" let:root>
                                {#if isSubDomain && !!$regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME && $regionalConsoleVariables._APP_DOMAIN_TARGET_CNAME !== 'localhost'}
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
                            <NameserverTable domain={domain?.domain} {verified} />
                        {:else}
                            <RecordTable
                                {verified}
                                service="sites"
                                variant={selectedTab}
                                domain={domain?.domain} />
                        {/if}

                        <Divider />

                        <Layout.Stack direction="row" justifyContent="flex-end">
                            <Button submit disabled={$isSubmitting}>Verify</Button>
                        </Layout.Stack>
                    </Layout.Stack>
                </Fieldset>
            </Layout.Stack>
        </Form>
    </Wizard>
{/if}
