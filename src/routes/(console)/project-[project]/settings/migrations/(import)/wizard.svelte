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
    import { Button, Card, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import { Form } from '$lib/elements/forms';
    import { Box, EyebrowHeading } from '$lib/components';
    import Credentials from './credentials.svelte';
    import ResourceForm from '$routes/(console)/(migration-wizard)/resource-form.svelte';

    const onExit = () => {
        resetImportStores();
    };

    const onFinish = async () => {
        try {
            const resources = migrationFormToResources($formData, $provider.provider);

            switch ($provider.provider) {
                case 'appwrite': {
                    await sdk.forProject.migrations.createAppwriteMigration(
                        resources,
                        $provider.endpoint,
                        $provider.projectID,
                        $provider.apiKey
                    );

                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'supabase': {
                    await sdk.forProject.migrations.createSupabaseMigration(
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
                    await sdk.forProject.migrations.createFirebaseMigration(
                        resources,
                        $provider.serviceAccount
                    );
                    invalidate(Dependencies.MIGRATIONS);
                    break;
                }
                case 'nhost': {
                    await sdk.forProject.migrations.createNHostMigration(
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
        appwrite: 'Appwrite Self-hosted',
        firebase: 'Firebase',
        supabase: 'Supabase',
        nhost: 'NHost'
    };

    let showResources = false;

    let showExitModal = false;
</script>

<Wizard
    title="Create Migration"
    bind:showExitModal
    confirmExit
    {onExit}>
    <Form onSubmit={onFinish}>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Source">
                <Layout.Stack gap="xl">
                    <Typography.Text variant="m-400">
                        Select a source platform with the project you want to migrate.
                        <Link href="https://appwrite.io/docs/advanced/migrations" external>
                            Learn about which platforms are supported.
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
                                imageRadius="s" />
                        {/each}
                    </div>
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Credentials">
                {#if !showResources}
                    <Credentials bind:formSubmitted={showResources} />
                {:else}
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="xs">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Text variant="m-500">Credentials set</Typography.Text>
                        </Layout.Stack>

                        <Button.Button
                            variant="secondary"
                            size="s"
                            on:click={() => (showResources = !showResources)}>Update</Button.Button>
                    </Layout.Stack>
                {/if}
            </Fieldset>

            {#if showResources}
                <Fieldset legend="Resources">
                    <Layout.Stack gap="xl">
                        <ResourceForm {formData} {provider} projectSdk={sdk.forProject} />
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>

    <!--    <svelte:fragment slot="aside">-->
    <!--        <Box radius="s">-->
    <!--            <div class="u-flex u-flex-vertical u-gap-16">-->
    <!--                <EyebrowHeading class="eyebrow" tag="h3" size={3}>Good to know</EyebrowHeading>-->
    <!--                <div class="u-flex u-gap-16">-->
    <!--                    <div class="circled">-->
    <!--                        <i class="icon-cog" />-->
    <!--                    </div>-->
    <!--                    <div>-->
    <!--                        <p class="u-bold">Project settings are not imported</p>-->
    <!--                        <p>You will need to set service and project settings manually</p>-->
    <!--                    </div>-->
    <!--                </div>-->
    <!--                <div class="u-flex u-gap-16">-->
    <!--                    <div class="circled">-->
    <!--                        <i class="icon-trending-up" />-->
    <!--                    </div>-->
    <!--                    <div>-->
    <!--                        <p class="u-bold">Keep your organization plan's limits in mind</p>-->
    <!--                        <p>-->
    <!--                            Make sure to have enough storage in your organization plan when-->
    <!--                            importing files.-->
    <!--                        </p>-->
    <!--                    </div>-->
    <!--                </div>-->
    <!--                {#if $provider.provider === 'firebase'}-->
    <!--                    <div class="u-flex u-gap-16">-->
    <!--                        <div class="circled">-->
    <!--                            <i class="icon-exclamation u-color-text-warning" />-->
    <!--                        </div>-->
    <!--                        <div>-->
    <!--                            <p class="u-bold">Possible charges by Firebase</p>-->
    <!--                            <p>-->
    <!--                                Appwrite does not impose charges for importing data, but please note-->
    <!--                                that Firebase may have its own pricing for this service-->
    <!--                            </p>-->
    <!--                        </div>-->
    <!--                    </div>-->
    <!--                {:else}-->
    <!--                    <div class="u-flex u-gap-16">-->
    <!--                        <div class="circled">-->
    <!--                            <i class="icon-currency-dollar" />-->
    <!--                        </div>-->
    <!--                        <div>-->
    <!--                            <p class="u-bold">Transfer is free of charge</p>-->
    <!--                            <p>-->
    <!--                                You won't be charged for Appwrite bandwidth usage for importing data-->
    <!--                            </p>-->
    <!--                        </div>-->
    <!--                    </div>-->
    <!--                {/if}-->
    <!--            </div>-->
    <!--        </Box>-->
    <!--    </svelte:fragment>-->

    <svelte:fragment slot="footer">
        <Button.Button
            variant="secondary"
            on:click={() => {
                showExitModal = true;
            }}>Cancel</Button.Button>

        <!-- todo: @itznotabug, correct disabled state -->
        <Button.Button variant="primary" disabled>Create</Button.Button>
    </svelte:fragment>
</Wizard>

<style>
    .providers {
        display: grid;
        gap: var(--gap-l, 16px);
        grid-template-columns: repeat(3, 1fr);
    }
</style>
