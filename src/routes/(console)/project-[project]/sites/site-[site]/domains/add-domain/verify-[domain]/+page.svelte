<script lang="ts">
    import { IconGlobeAlt } from '@appwrite.io/pink-icons-svelte';
    import { Card, Divider, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import VerificationFieldset from './verificationFieldset.svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { page } from '$app/stores';
    import Wizard from '$lib/layout/wizard.svelte';
    import { base } from '$app/paths';
    import { writable } from 'svelte/store';

    export let data;
    let selectedTab: 'cname' | 'nameserver';
    let domainData = data.domain;

    let routeBase = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;
    let isSubmitting = writable(false);

    async function addDomain() {
        const isNewDomain =
            data.domainsList.domains.findIndex((rule) => rule.domain === $page.params.domain) ===
            -1;
        try {
            // if (selectedTab === 'cname'){
            //     domainData = await sdk.forProject.proxy.updateRuleVerification(
            //         $page.params.domain
            //     );
            // }
            if (isNewDomain && isCloud) {
                domainData = await sdk.forConsole.domains.create(
                    $organization.$id,
                    $page.params.domain
                );
            }

            addNotification({
                type: 'success',
                message: 'Domain added successfully'
            });
            await goto(routeBase);
            await invalidate(Dependencies.DOMAINS);
            await invalidate(Dependencies.SITES_DOMAINS);
        } catch (error) {
            await invalidate(Dependencies.DOMAINS);

            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function back() {
        if ($page.url.searchParams.has('rule')) {
            const rule = $page.url.searchParams.get('rule');
            await sdk.forProject.proxy.deleteRule(rule);
        }
        await goto(`${routeBase}/add-domain?domain=${$page.params.domain}`);
    }

    $: isVerified = domainData?.nameservers
        ? domainData?.nameservers.toLocaleLowerCase() === 'appwrite'
        : undefined;
</script>

<Wizard title="Add domain" href={routeBase} column columnSize="s">
    <Form onSubmit={addDomain} bind:isSubmitting>
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
                            {$page.params.domain}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button secondary on:click={back}>Change</Button>
                </Layout.Stack>
            </Card.Base>

            <VerificationFieldset
                domain={$page.params.domain}
                verified={isVerified}
                bind:selectedTab>
                <Divider />
                <Layout.Stack direction="row" justifyContent="flex-end">
                    <div>
                        <Button submit disabled={$isSubmitting}>Verify</Button>
                    </div>
                </Layout.Stack>
            </VerificationFieldset>
        </Layout.Stack>
    </Form>
</Wizard>
