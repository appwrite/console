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
        Fieldset,
        Layout,
        Tooltip,
        Icon,
        Card as PinkCard,
        Empty,
        Alert
    } from '@appwrite.io/pink-svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sortBranches } from '$lib/stores/vcs';
    import { organization } from '$lib/stores/organization';
    import { consoleVariables } from '$routes/(console)/store';
    import InputDomain from '$lib/elements/forms/inputDomain.svelte';
    import { IconGithub, IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { LabelCard } from '$lib/components';
    import { writable } from 'svelte/store';
    import { ConnectGit } from '$lib/components/git';
    import ConnectRepoModal from '../../../(components)/connectRepoModal.svelte';
    import { isCloud } from '$lib/system';

    const backPage = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    export let data;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let showConnectRepo = false;

    let domain = '';
    let domainData: Models.ProxyRule;

    let redirect = null;
    let statusCode = null;

    let branch = null;

    const redirectOptions = data.domains.rules
        .filter((d) => !d.domain.endsWith($consoleVariables._APP_DOMAIN_SITES))
        .map((domain) => ({
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

        if (behaviour === 'redirect') {
            try {
                if (isNewDomain && !isSubDomain && isCloud) {
                    await sdk.forConsole.domains.create($organization.$id, domain);
                }
                domainData = await sdk.forProject.proxy.createRedirectRule(domain, redirect);
                invalidate(Dependencies.SITES_DOMAINS);

                if (isNewDomain && !isSubDomain) {
                    goto(
                        `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains/add-domain/verify`
                    );
                }
            } catch (error) {
                addNotification({
                    type: 'error',
                    message: error.message
                });
            }
        } else {
            try {
                if (isNewDomain && !isSubDomain && isCloud) {
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

    let behaviour: 'redirect' | 'create' = 'create';
    $: console.log($consoleVariables);
</script>

<Wizard title="Add custom domain" href={backPage} column columnSize="s">
    <Form bind:this={formComponent} onSubmit={addDomain} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Details">
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
            </Fieldset>

            <Layout.Grid columns={2} columnsXS={1}>
                <LabelCard
                    value="create"
                    bind:group={behaviour}
                    title="Connect to active deployment">
                    Connect this domain to your active deployment and configure the linked Git
                    branch as needed.
                </LabelCard>
                <LabelCard
                    value="redirect"
                    bind:group={behaviour}
                    title="Redirect to another domain">
                    Automatically forward traffic from this domain to another URL of your choice.
                </LabelCard>
            </Layout.Grid>

            {#if behaviour === 'create'}
                <Fieldset legend="Configuration">
                    <Layout.Stack gap="xl">
                        {#if data.branches?.total}
                            {@const sortedBranches = sortBranches(data.branches.branches)}
                            {@const options = sortedBranches.map((branch) => ({
                                label: branch.name,
                                value: branch.name
                            }))}
                            <InputSelect
                                {options}
                                label="Production branch"
                                id="branch"
                                bind:value={branch}
                                placeholder="Select branch" />
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

                <!-- {:else if data.site.installationId || data.installations?.total}
                    <PinkCard.Base padding="none" border="dashed">
                        <Empty
                            type="secondary"
                            title="Connect Git repository"
                            description="Link a repository to associate your domain with an active deployment.">
                            <svelte:fragment slot="actions">
                                <Button secondary on:click={() => (showConnectRepo = true)}>
                                    <Icon icon={IconGithub} size="s" slot="start" />
                                    Connect Git repository
                                </Button>
                            </svelte:fragment>
                        </Empty>
                    </PinkCard.Base>
                {:else}
                    <ConnectGit callbackState={{ newInstallation: 'true' }} />
                {/if} -->
            {:else if behaviour === 'redirect'}
                <Fieldset legend="Configuration">
                    <Layout.Stack gap="xl">
                        <InputSelect
                            label="Redirect to"
                            id="redirect"
                            placeholder="Select domain"
                            options={redirectOptions}
                            bind:value={redirect}
                            required>
                            <Tooltip slot="info">
                                <Icon icon={IconInfo} size="s" />
                                <span slot="tooltip">
                                    Redirect this domain. Domains added to your project will be
                                    listed here.
                                </span>
                            </Tooltip>
                        </InputSelect>
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
        <Button secondary href={backPage}>Cancel</Button>
        <Button on:click={() => formComponent.triggerSubmit()} disabled={$isSubmitting}>Add</Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepo}
    <ConnectRepoModal bind:show={showConnectRepo} site={data.site} />
{/if}
