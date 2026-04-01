<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Compute, Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';

    type DedicatedDatabaseWithSecurity = Models.DedicatedDatabase & {
        securityAuditLogEnabled: boolean;
        securityLogRetentionDays: number;
        securityEncryptionAtRest: boolean;
        securityKeyManagement: string;
        securityDataResidency: string;
    };

    let {
        database: rawDatabase
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    const database = rawDatabase as DedicatedDatabaseWithSecurity;

    function getKeyManagementLabel(km: string): string {
        switch (km) {
            case 'appwriteKms':
                return 'Appwrite KMS';
            case 'customerManaged':
                return 'Customer-managed';
            default:
                return km;
        }
    }

    function getResidencyLabel(residency: string): string {
        switch (residency) {
            case 'eu':
                return 'European Union';
            case 'us':
                return 'United States';
            case 'apac':
                return 'Asia Pacific';
            case 'global':
                return 'Global';
            default:
                return residency;
        }
    }

    let auditLogEnabled: boolean = $state(database.securityAuditLogEnabled);
    let logRetentionDays: number = $state(database.securityLogRetentionDays);

    let initialAuditLogEnabled = $state(database.securityAuditLogEnabled);
    let initialLogRetentionDays = $state(database.securityLogRetentionDays);

    const hasChanges = $derived(
        auditLogEnabled !== initialAuditLogEnabled || logRetentionDays !== initialLogRetentionDays
    );

    async function updateSecurity() {
        try {
            await sdk.forProject(page.params.region, page.params.project).compute.updateDatabase({
                databaseId: database.$id,
                securityAuditLogEnabled: auditLogEnabled,
                securityLogRetentionDays: logRetentionDays
            } as unknown as Parameters<Compute['updateDatabase']>[0]);

            initialAuditLogEnabled = auditLogEnabled;
            initialLogRetentionDays = logRetentionDays;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Security settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateSecurity);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateSecurity);
        }
    }
</script>

<Form onSubmit={updateSecurity}>
    <CardGrid>
        <svelte:fragment slot="title">Security</svelte:fragment>
        Manage encryption, key management, data residency, and audit logging for your database.
        <svelte:fragment slot="aside">
            <ul>
                <li class="u-margin-block-end-16">
                    <div class="box">
                        <Layout.Stack direction="column" gap="xs">
                            <Layout.Stack direction="row" gap="s">
                                <span class="u-bold">Encryption at rest:</span>
                                <span
                                    >{database.securityEncryptionAtRest
                                        ? 'Enabled'
                                        : 'Disabled'}</span>
                            </Layout.Stack>
                            <Layout.Stack direction="row" gap="s">
                                <span class="u-bold">Key management:</span>
                                <span>{getKeyManagementLabel(database.securityKeyManagement)}</span>
                            </Layout.Stack>
                            <Layout.Stack direction="row" gap="s">
                                <span class="u-bold">Data residency:</span>
                                <span>{getResidencyLabel(database.securityDataResidency)}</span>
                            </Layout.Stack>
                        </Layout.Stack>
                    </div>
                </li>

                <InputSwitch
                    id="auditLogEnabled"
                    label="Enable audit log"
                    bind:value={auditLogEnabled} />
                {#if auditLogEnabled}
                    <InputNumber
                        id="logRetentionDays"
                        label="Log retention (days)"
                        min={1}
                        max={365}
                        bind:value={logRetentionDays}
                        required />
                {/if}
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
