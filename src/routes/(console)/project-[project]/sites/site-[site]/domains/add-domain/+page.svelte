<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button, Form, InputDomain, InputSelect, InputURL } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Fieldset, Layout, Tooltip, Icon, Input, Alert } from '@appwrite.io/pink-svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sortBranches } from '$lib/stores/vcs';
    import { protocol } from '$routes/(console)/store';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { LabelCard } from '$lib/components';
    import { StatusCode, type Models } from '@appwrite.io/console';
    import { statusCodeOptions } from '$lib/stores/domains';
    import ConnectRepoModal from '../../../(components)/connectRepoModal.svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';

    const routeBase = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    export let data;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let showConnectRepo = false;

    let behaviour: 'REDIRECT' | 'BRANCH' | 'ACTIVE' = 'ACTIVE';
    let domainName = '';
    let redirect: string = null;
    let statusCode = 307;
    let branch = null;

    onMount(() => {
        if (
            $page.url.searchParams.has('connectRepo') &&
            $page.url.searchParams.get('connectRepo') === 'true'
        ) {
            showConnectRepo = true;
        }
        if ($page.url.searchParams.has('domain')) {
            domainName = $page.url.searchParams.get('domain');
        }
    });

    async function addDomain() {
        try {
            let rule: Models.ProxyRule;
            if (behaviour === 'BRANCH') {
                rule = await sdk.forProject.proxy.createSiteRule(
                    domainName,
                    $page.params.site,
                    branch
                );
            } else if (behaviour === 'REDIRECT') {
                const sc = Object.values(StatusCode).find((code) => parseInt(code) === statusCode);
                rule = await sdk.forProject.proxy.createRedirectRule(
                    domainName,
                    $protocol + redirect,
                    sc
                );
            } else if (behaviour === 'ACTIVE') {
                rule = await sdk.forProject.proxy.createSiteRule(domainName, $page.params.site);
            }
            if (rule?.status === 'verified') {
                await goto(routeBase);
                await invalidate(Dependencies.SITES_DOMAINS);
            } else {
                await goto(`${routeBase}/add-domain/verify-${domainName}?rule=${rule.$id}`);
                await invalidate(Dependencies.SITES_DOMAINS);
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Wizard title="Add domain" href={routeBase} column columnSize="s" confirmExit>
    <Form bind:this={formComponent} onSubmit={addDomain} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Domain">
                <!-- <Input.ComboBox
                    label="Domain"
                    id="domain"
                    name="domain"
                    bind:value={domain}
                    options={data.domains.rules.map((domain) => ({
                        label: domain.domain,
                        value: domain.domain
                    }))}
                    required
                    placeholder="appwrite.example.com" /> -->
                <InputDomain
                    label="Domain"
                    id="domain"
                    bind:value={domainName}
                    required
                    placeholder="appwrite.example.com" />
            </Fieldset>

            <Layout.Grid columns={3} columnsXS={1}>
                <LabelCard value="ACTIVE" bind:group={behaviour} title="Active deployment">
                    Point this domain to the latest deployed version.
                </LabelCard>
                <LabelCard value="BRANCH" bind:group={behaviour} title="Git branch">
                    Point this domain to a specific branch in your repository.
                </LabelCard>
                <LabelCard value="REDIRECT" bind:group={behaviour} title="Redirect">
                    Forward all traffic from this domain to another URL.
                </LabelCard>
            </Layout.Grid>

            {#if behaviour === 'BRANCH'}
                <Fieldset legend="Settings">
                    <Layout.Stack gap="xl">
                        {#if data.site?.providerRepositoryId}
                            {@const sortedBranches = sortBranches(data.branches.branches)}
                            {@const options = sortedBranches.map((branch) => ({
                                label: branch.name,
                                value: branch.name
                            }))}
                            <Layout.Stack gap="s">
                                <InputSelect
                                    {options}
                                    label="Production branch"
                                    id="branch"
                                    required
                                    bind:value={branch}
                                    placeholder="Select branch" />
                                {#if !data.branches?.total}
                                    <Input.Helper state="default">
                                        No branches found in the selected repository. Create a
                                        branch to see it here.
                                    </Input.Helper>
                                {/if}
                            </Layout.Stack>
                        {:else}
                            <InputSelect
                                disabled
                                options={[{ label: 'main', value: 'main' }]}
                                label="Production branch"
                                id="branch"
                                required
                                value="main"
                                placeholder="Select branch" />
                            <Alert.Inline title=" There is no repository connected to your site">
                                <Layout.Stack>
                                    <p>
                                        The domain will be connected to your active deployment.
                                        Connect your Git repository to link a production branch.
                                    </p>
                                    <div>
                                        <Button compact on:click={() => (showConnectRepo = true)}>
                                            Connect repository
                                        </Button>
                                    </div>
                                </Layout.Stack>
                            </Alert.Inline>
                        {/if}
                    </Layout.Stack>
                </Fieldset>
            {:else if behaviour === 'REDIRECT'}
                <Fieldset legend="Settings">
                    <Layout.Stack gap="xl">
                        <InputURL
                            label="Redirect to"
                            id="redirect"
                            placeholder="https://appwrite.io/docs"
                            bind:value={redirect}
                            required>
                            <Tooltip slot="info">
                                <Icon icon={IconInfo} size="s" />
                                <span slot="tooltip">
                                    Redirect this domain. Domains added to your project will be
                                    listed here.
                                </span>
                            </Tooltip>
                        </InputURL>
                        <InputSelect
                            options={statusCodeOptions}
                            label="Status code"
                            id="code"
                            required
                            bind:value={statusCode}
                            placeholder="Select status code" />
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button secondary href={routeBase}>Cancel</Button>
        <Button on:click={() => formComponent.triggerSubmit()} bind:disabled={$isSubmitting}>
            Add
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepo}
    <ConnectRepoModal
        bind:show={showConnectRepo}
        site={data.site}
        onlyExisting
        callbackState={{ connectRepo: 'true' }} />
{/if}
