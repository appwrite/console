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
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { page } from '$app/state';
    import Wizard from '$lib/layout/wizard.svelte';
    import { writable } from 'svelte/store';
    import RecordTable from '$lib/components/domains/recordTable.svelte';
    import NameserverTable from '$lib/components/domains/nameserverTable.svelte';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { type Models } from '@appwrite.io/console';

    let {
        rule,
        domain,
        onChangeDomain,
        onVerified,
        show = $bindable(false)
    }: {
        show: boolean;
        rule?: Models.ProxyRule;
        domain: Models.Domain;
        onChangeDomain: () => void;
        onVerified?: () => void;
    } = $props();

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

    let selectedTab = $state<'cname' | 'nameserver' | 'a' | 'aaaa'>(getDefaultTab());
    let verified: boolean | undefined = $state(undefined);
    let isSubmitting = $state(writable(false));

    async function verify() {
        try {
            if (isCloud) {
                try {
                    await sdk.forConsole.domains.updateNameservers({
                        domainId: domain.$id
                    });
                } catch (error) {
                    // Ignore error
                }
            }

            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.updateRuleVerification({ ruleId: rule.$id });

            verified = true;

            addNotification({
                type: 'success',
                message: 'Domain verified successfully'
            });

            show = false;
            onVerified?.();
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
                .proxy.deleteRule({ ruleId: rule.$id });
        }

        show = false;
        onChangeDomain();
    }

    function getDefaultTab() {
        return showCNAMETab ? 'cname' : showATab ? 'a' : showAAAATab ? 'aaaa' : 'nameserver';
    }
</script>

{#if show}
    <Wizard column columnSize="s" title="Add domain" confirmExit onExit={() => (show = false)}>
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
                                {rule?.domain}
                            </Typography.Text>
                        </Layout.Stack>
                        <Button secondary on:click={changeDomain}>Change</Button>
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
                            <NameserverTable domain={rule?.domain} {verified} />
                        {:else}
                            <RecordTable
                                {verified}
                                service="sites"
                                variant={selectedTab}
                                domain={rule?.domain}
                                ruleStatus={rule?.status}
                                onNavigateToNameservers={() => (selectedTab = 'nameserver')}
                                onNavigateToA={() => (selectedTab = 'a')}
                                onNavigateToAAAA={() => (selectedTab = 'aaaa')} />
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
