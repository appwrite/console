<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';
    import {
        Badge,
        Divider,
        Fieldset,
        Layout,
        Typography,
        Spinner,
        Input
    } from '@appwrite.io/pink-svelte';
    import RecordsCard from '../recordsCard.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sortBranches } from '$lib/stores/vcs';
    import { organization } from '$lib/stores/organization';
    import { consoleVariables } from '$routes/(console)/store';
    import InputDomain from '$lib/elements/forms/inputDomain.svelte';

    const backPage = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    export let data;
    let domain = '';
    let domainData: Models.ProxyRule;

    let redirect = null;
    let statusCode = null;

    let branch = null;

    const domainsOptions = data.domains.rules.map((domain) => ({
        label: domain.domain,
        value: domain.domain
    }));

    const statusCodeOptions = [
        {
            label: '301 Moved permanently',
            value: 301
        },
        {
            label: '302 Found',
            value: 302
        },
        {
            label: '303 See other',
            value: 303
        },
        {
            label: '307 Temporary redirect',
            value: 307
        },
        {
            label: '308 Permanent redirect',
            value: 308
        }
    ];

    async function addDomain() {
        const isNewDomain = data.domains.rules.findIndex((rule) => rule.domain === domain) === -1;
        const isSubDomain = domain.endsWith(`.${$consoleVariables._APP_DOMAIN_SITES}`);
        if (redirect) {
            try {
                if (isNewDomain && !isSubDomain) {
                    await sdk.forConsole.domains.create($organization.$id, domain);
                }
                domainData = await sdk.forProject.proxy.createRedirectRule(domain, redirect);
                invalidate(Dependencies.SITES_DOMAINS);
            } catch (error) {
                addNotification({
                    type: 'error',
                    message: error.message
                });
            }
        } else {
            try {
                if (isNewDomain && !isSubDomain) {
                    await sdk.forConsole.domains.create($organization.$id, domain);
                }
                domainData = await sdk.forProject.proxy.createSiteRule(
                    domain,
                    $page.params.site,
                    branch
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

    $: console.log($consoleVariables);
</script>

<Wizard title="Add domain" href={backPage} column columnSize="s">
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
                    <!-- <Input.ComboBox
                        label="Domain"
                        id="domain"
                        name="domain"
                        bind:value={domain}
                        options={domainsOptions}
                        required
                        placeholder="appwrite.example.com" /> -->
                    <InputDomain
                        label="Domain"
                        id="domain"
                        bind:value={domain}
                        required
                        placeholder="appwrite.example.com" />
                    <InputSelect
                        label="Redirect to"
                        id="redirect"
                        options={[
                            {
                                label: 'No redirect',
                                value: null
                            },
                            ...domainsOptions
                        ]}
                        bind:value={redirect}
                        required />
                    {#if redirect}
                        <InputSelect
                            options={statusCodeOptions}
                            label="Status code"
                            id="code"
                            bind:value={statusCode}
                            placeholder="Select status code" />
                    {/if}

                    {#if data.branches.total}
                        {@const sortedBranches = sortBranches(data.branches.branches)}
                        {@const options = sortedBranches.map((branch) => ({
                            label: branch.name,
                            value: branch.name
                        }))}
                        <InputSelect
                            disabled={!!redirect}
                            {options}
                            label="Production branch"
                            id="branch"
                            bind:value={branch}
                            placeholder="Select branch" />
                    {/if}

                    <Divider />
                    <Layout.Stack alignItems="flex-end">
                        <Button submit>Add</Button>
                    </Layout.Stack>
                </Layout.Stack>
            </Form>
        </Fieldset>
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary href={backPage}>Cancel</Button>
        {#if domainData}
            <Button secondary href={backPage}>Go to dashboard</Button>
        {/if}
    </svelte:fragment>
</Wizard>
