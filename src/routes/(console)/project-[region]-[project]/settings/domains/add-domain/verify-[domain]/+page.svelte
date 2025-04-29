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
    import { page } from '$app/state';
    import Wizard from '$lib/layout/wizard.svelte';
    import { base } from '$app/paths';
    import { writable } from 'svelte/store';

    let { data } = $props();

    const ruleId = page.url.searchParams.get('rule');
    const routeBase = `${base}/project-${page.params.project}/settings/domains`;
    let selectedTab: 'cname' | 'nameserver' = $state();
    let verified = $state(false);

    let isSubmitting = $state(writable(false));

    async function verify() {
        const isNewDomain =
            data.domainsList.domains.findIndex((rule) => rule.domain === page.params.domain) === -1;
        try {
            if (selectedTab === 'cname') {
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

            <VerificationFieldset domain={page.params.domain} {verified} bind:selectedTab>
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
