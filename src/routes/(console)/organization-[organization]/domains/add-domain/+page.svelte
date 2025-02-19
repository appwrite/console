<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { InputDomain } from '$lib/elements/forms/index.js';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ResourceType, type Models } from '@appwrite.io/console';
    import {
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
</script>

<Wizard title="Add domain" href={backPage} column columnSize="s" hideFooter={!domainData}>
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
            <Form onSubmit={addDomain}>
                <Layout.Stack gap="xl">
                    <InputDomain
                        label="Domain"
                        id="domain"
                        name="domain"
                        bind:value={domain}
                        required
                        placeholder="appwrite.example.com" />

                    <Divider />
                    <Layout.Stack alignItems="flex-end">
                        <Button submit>Add</Button>
                    </Layout.Stack>
                </Layout.Stack>
            </Form>
        </Fieldset>
    {/if}

    <svelte:fragment slot="footer">
        <Button text href={backPage}>Cancel</Button>
        {#if domainData}
            <Button secondary href={backPage}>Skip to console</Button>
        {/if}
    </svelte:fragment>
</Wizard>
