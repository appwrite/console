<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { onDestroy } from 'svelte';
    import { formData, provider, resetImportStores } from '.';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { migrationFormToResources, type Provider } from '$lib/stores/migration';
    import { started } from '../stores';
    import { showMigrationBox } from '$lib/components/migrationBox.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import {
        Button,
        Card,
        Divider,
        Fieldset,
        Icon,
        Layout,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import { EyebrowHeading } from '$lib/components';
    import Credentials from './credentials.svelte';
    import ResourceForm from '$routes/(console)/(migration-wizard)/resource-form.svelte';
    import {
        IconCog,
        IconCurrencyDollar,
        IconExclamation,
        IconTrendingUp
    } from '@appwrite.io/pink-icons-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { page } from '$app/state';

    const onExit = () => {
        resetImportStores();
    };

    const onFinish = async () => {
        try {
            const resources = migrationFormToResources($formData, $provider.provider);

            switch ($provider.provider) {
                case 'appwrite': {
                    await sdk
                        .forProject(page.params.region, page.params.project)
                        .migrations.createAppwriteMigration(
                            resources,
                            $provider.endpoint,
                            $provider.projectID,
                            $provider.apiKey
                        );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'supabase': {
                    await sdk
                        .forProject(page.params.region, page.params.project)
                        .migrations.createSupabaseMigration(
                            resources,
                            $provider.endpoint,
                            $provider.apiKey,
                            $provider.host,
                            $provider.username || 'postgres',
                            $provider.password,
                            $provider.port || 5432
                        );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'firebase': {
                    await sdk
                        .forProject(page.params.region, page.params.project)
                        .migrations.createFirebaseMigration(resources, $provider.serviceAccount);
                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'nhost': {
                    await sdk
                        .forProject(page.params.region, page.params.project)
                        .migrations.createNHostMigration(
                            resources,
                            $provider.subdomain,
                            $provider.region,
                            $provider.adminSecret,
                            $provider.database || $provider.subdomain,
                            $provider.username || 'postgres',
                            $provider.password
                        );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
            }
            resetImportStores();
            wizard.hide();
            started.set(performance.now());

            showMigrationBox.set(true);
        } catch (e) {
            addNotification({
                title: 'Error',
                message: e.message,
                type: 'error'
            });
        }
    };

    onDestroy(onExit);

    const providers: Record<Provider, string> = {
        appwrite: 'Appwrite self-hosted',
        firebase: 'Firebase',
        supabase: 'Supabase',
        nhost: 'NHost'
    };

    let showResources = false;
    let showExitModal = false;
    let errorInResources = false;
    $: isFinalsButtonEnabled =
        !errorInResources &&
        showResources &&
        Object.values($formData).some((category) =>
            Object.values(category).some((value) => value === true)
        );
</script>

<Wizard title="Create migration" bind:showExitModal confirmExit {onExit}>
    <Layout.Stack gap="l">
        <Layout.Stack gap="xxl">
            <Fieldset legend="Source">
                <Layout.Stack gap="xl">
                    {#if !showResources}
                        <Typography.Text variant="m-400">
                            Select a source platform with the project you want to migrate.
                            <Link href="https://appwrite.io/docs/advanced/migrations" external>
                                Learn more.
                            </Link>
                        </Typography.Text>

                        <div class="providers">
                            {#each Object.entries(providers) as [key, platform]}
                                <Card.Selector
                                    bind:group={$provider.provider}
                                    name={key}
                                    id={key}
                                    value={key}
                                    title={platform}
                                    imageRadius="s"
                                    disabled={showResources} />
                            {/each}
                        </div>

                        <Divider />

                        <Credentials bind:formSubmitted={showResources} />
                    {:else}
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            gap="xs">
                            <Typography.Text variant="m-500">
                                {capitalize($provider.provider)}
                            </Typography.Text>

                            <Button.Button
                                size="s"
                                variant="secondary"
                                on:click={() => (showResources = !showResources)}>
                                Update
                            </Button.Button>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </Fieldset>

            {#if showResources}
                <Fieldset legend="Resources">
                    <Layout.Stack gap="xl">
                        <ResourceForm
                            {formData}
                            {provider}
                            bind:errorInResources
                            projectSdk={sdk.forProject} />
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="aside">
        <Card.Base variant="primary" radius="s" padding="m">
            <Layout.Stack gap="l">
                <EyebrowHeading class="eyebrow" tag="h3" size={3}>Good to know</EyebrowHeading>

                <!-- tip 1 -->
                <Layout.Stack gap="l" direction="row" wrap="normal">
                    <span class="icon-wrapper">
                        <Icon icon={IconCog} size="s" />
                    </span>
                    <Layout.Stack gap="none">
                        <Typography.Text variant="m-600"
                            >Project settings are not imported</Typography.Text>
                        You will need to set service and project settings manually.
                    </Layout.Stack>
                </Layout.Stack>

                <!-- tip 2 -->
                <Layout.Stack gap="l" direction="row" wrap="normal">
                    <span class="icon-wrapper">
                        <Icon icon={IconTrendingUp} size="s" />
                    </span>
                    <Layout.Stack gap="none">
                        <Typography.Text variant="m-600"
                            >Keep your organization plan's limits in mind</Typography.Text>
                        Make sure to have enough storage in your organization plan when importing files.
                    </Layout.Stack>
                </Layout.Stack>

                <!-- tip 3 -->
                <Layout.Stack gap="l" direction="row" wrap="normal">
                    {@const isFirebase = $provider.provider === 'firebase'}
                    <span class="icon-wrapper" style:padding-block="3px">
                        <Icon
                            icon={isFirebase ? IconExclamation : IconCurrencyDollar}
                            size="s"
                            color={isFirebase ? '--fgcolor-warning' : undefined} />
                    </span>
                    <Layout.Stack gap="none">
                        <Typography.Text variant="m-600">
                            {isFirebase
                                ? 'Possible charges by Firebase'
                                : 'Transfer is free of charge'}
                        </Typography.Text>

                        {#if isFirebase}
                            Appwrite does not impose charges for importing data, but please note
                            that Firebase may have its own pricing for this service
                        {:else}
                            You won't be charged for Appwrite bandwidth usage for importing data
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button.Button
            variant="secondary"
            on:click={() => {
                showExitModal = true;
            }}>Cancel</Button.Button>

        <Button.Button variant="primary" disabled={!isFinalsButtonEnabled} on:click={onFinish}
            >Create</Button.Button>
    </svelte:fragment>
</Wizard>

<style>
    .providers {
        display: grid;
        gap: var(--gap-l, 16px);
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

        @media (max-width: 768px) {
            display: flex;
            flex-direction: column;
        }
    }

    .icon-wrapper {
        padding-block: 2px;
    }
</style>
