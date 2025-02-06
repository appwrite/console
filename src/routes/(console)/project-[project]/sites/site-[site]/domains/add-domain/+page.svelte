<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { InputDomain } from '$lib/elements/forms/index.js';
    import Link from '$lib/elements/link.svelte';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ResourceType, type Models } from '@appwrite.io/console';
    import {
        Alert,
        Accordion,
        Badge,
        Divider,
        Fieldset,
        Layout,
        Typography,
        Spinner
    } from '@appwrite.io/pink-svelte';
    import RecordsCard from '../recordsCard.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const backPage = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    let domain = '';
    let domainData: Models.ProxyRule;

    async function addDomain() {
        try {
            domainData = await sdk.forProject.proxy.createRule(
                domain,
                ResourceType.Site,
                $page.params.site
            );
            console.log(domainData);
            invalidate(Dependencies.SITES_DOMAINS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function verifyStatus() {
        try {
            domainData = await sdk.forProject.proxy.updateRuleVerification(domainData.$id);
            console.log(domainData);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function back() {
        try {
            await sdk.forProject.proxy.deleteRule(domainData.$id);
            domainData = undefined;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    type DomainTips = {
        title: string;
        message: string;
    };

    const siteDomainTips: DomainTips[] = [
        {
            title: 'Why a Top-Level Domain (TLD) matters for your site?',
            message:
                'A custom TLD helps create a unique web address, improves brand recognition, and makes your domain more memorable.'
        },
        {
            title: 'What is DNS and why do you need it?',
            message:
                "DNS (Domain Name System) translates your domain name into an IP address, directing visitors to your website. It's essential for making your site accessible and ensuring it loads properly for users."
        }
    ];
</script>

<Wizard title="Add domain" href={backPage}>
    {#if domainData}
        {#if domainData.status === 'created'}
            <RecordsCard domain={domainData}>
                <Divider />
                <Layout.Stack direction="row" justifyContent="flex-end">
                    <Button text on:click={back}>Back</Button>
                    <Button secondary on:click={verifyStatus}>Verify</Button>
                </Layout.Stack>
            </RecordsCard>
        {:else if domainData.status === 'verifying'}
            <Card radius="s">
                <Layout.Stack gap="s" direction="row" alignItems="center">
                    <Typography.Text variant="l-500">{domainData.domain}</Typography.Text>
                    <Badge variant="secondary" type="success" content="Verified" />
                    <Badge variant="secondary" content="Generating certificate...">
                        <svelte:fragment slot="start">
                            <Spinner size="s" />
                        </svelte:fragment>
                    </Badge>
                </Layout.Stack>
            </Card>
        {:else if domainData.status === 'verified'}
            <Card radius="s">
                <Layout.Stack gap="s" direction="row" alignItems="center">
                    <Typography.Text variant="l-500">{domainData.domain}</Typography.Text>
                    <Badge variant="secondary" type="success" content="Verified" />
                    <Badge variant="secondary" type="success" content="Generated certificate" />
                </Layout.Stack>
            </Card>
        {/if}
    {:else}
        <Fieldset legend="Configuration">
            <Layout.Stack gap="l">
                <Form onSubmit={addDomain}>
                    <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                        <InputDomain
                            label="Domain"
                            id="domain"
                            name="domain"
                            bind:value={domain}
                            required
                            placeholder="appwrite.example.com" />
                        <Button secondary submit>Add</Button>
                    </Layout.Stack>
                </Form>
                <Alert.Inline title="Domain providers and DNS settings" hideActions>
                    A list of all domain providers and their DNS setting is available <Link href="#"
                        >here</Link
                    >.
                </Alert.Inline>
            </Layout.Stack>
        </Fieldset>
    {/if}

    <svelte:fragment slot="aside">
        <Card>
            <Layout.Stack direction="column">
                {#each siteDomainTips as tips, i}
                    <Accordion title={tips.title} hideDivider={i === siteDomainTips.length - 1}>
                        {tips.message}
                    </Accordion>
                {/each}
            </Layout.Stack>
        </Card>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button secondary href={backPage}>Cancel</Button>
        {#if domainData}
            <Button secondary href={backPage}>Go to dashboard</Button>
        {/if}
    </svelte:fragment>
</Wizard>
