<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let extensions: Models.DedicatedDatabaseExtensions | null = $state(null);
    let isLoading = $state(true);
    let selectedExtension: string = $state('');
    let isInstalling = $state(false);
    let showUninstallConfirm = $state(false);
    let extensionToUninstall: string | null = $state(null);
    let isUninstalling = $state(false);

    const availableOptions = $derived(
        extensions
            ? extensions.available
                  .filter((ext) => !extensions.installed.includes(ext))
                  .sort()
                  .map((ext) => ({ value: ext, label: ext }))
            : []
    );

    onMount(async () => {
        try {
            extensions = await sdk
                .forProject(page.params.region, page.params.project)
                .compute.listDatabaseExtensions({ databaseId: database.$id });
        } catch {
            extensions = { installed: [], available: [] };
        } finally {
            isLoading = false;
        }
    });

    async function installExtension() {
        if (!selectedExtension) return;
        isInstalling = true;
        try {
            extensions = await sdk
                .forProject(page.params.region, page.params.project)
                .compute.createDatabaseExtension({ databaseId: database.$id, name: selectedExtension });

            selectedExtension = '';

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Extension has been installed',
                type: 'success'
            });

            trackEvent(Submit.DatabaseInstallExtension);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseInstallExtension);
        } finally {
            isInstalling = false;
        }
    }

    async function uninstallExtension() {
        if (!extensionToUninstall) return;
        isUninstalling = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .compute.deleteDatabaseExtension({ databaseId: database.$id, extensionName: extensionToUninstall });

            if (extensions) {
                extensions = {
                    installed: extensions.installed.filter((e) => e !== extensionToUninstall),
                    available: [...extensions.available, extensionToUninstall].sort()
                };
            }

            showUninstallConfirm = false;
            extensionToUninstall = null;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Extension has been uninstalled',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUninstallExtension);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUninstallExtension);
        } finally {
            isUninstalling = false;
        }
    }
</script>

{#if !isLoading && extensions}
    <Form onSubmit={installExtension}>
        <CardGrid>
            <svelte:fragment slot="title">Extensions</svelte:fragment>
            Manage PostgreSQL extensions for your database. Extensions add additional functionality such
            as full-text search, geospatial queries, and more.
            <svelte:fragment slot="aside">
                <ul>
                    {#if extensions.installed.length > 0}
                        <li class="u-margin-block-end-16">
                            <label class="label u-margin-block-end-8">Installed extensions</label>
                            <Layout.Stack direction="row" gap="xs" wrap="wrap">
                                {#each extensions.installed as ext}
                                    <Badge
                                        variant="secondary"
                                        content={ext} />
                                {/each}
                            </Layout.Stack>
                        </li>
                    {:else}
                        <li class="u-margin-block-end-16">
                            <p class="text">No extensions installed.</p>
                        </li>
                    {/if}

                    {#if availableOptions.length > 0}
                        <InputSelect
                            id="extensionSelect"
                            label="Add extension"
                            placeholder="Select an extension"
                            bind:value={selectedExtension}
                            options={availableOptions} />
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!selectedExtension || isInstalling} submit>
                    {isInstalling ? 'Installing...' : 'Install'}
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Modal
        title="Uninstall extension"
        bind:show={showUninstallConfirm}
        onSubmit={uninstallExtension}>
        <p class="text">
            Are you sure you want to uninstall the extension <b>{extensionToUninstall}</b> from
            <b>{database.name}</b>? Any database objects that depend on this extension may stop
            working.
        </p>
        <svelte:fragment slot="footer">
            <Button
                text
                on:click={() => {
                    showUninstallConfirm = false;
                    extensionToUninstall = null;
                }}>Cancel</Button>
            <Button danger submit disabled={isUninstalling}>
                {isUninstalling ? 'Uninstalling...' : 'Uninstall'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
