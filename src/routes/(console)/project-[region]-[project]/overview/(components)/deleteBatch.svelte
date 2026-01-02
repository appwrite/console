<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;
    export let keyIds: string[] = [];
    export let keyType: 'api' | 'dev' | 'organization' | 'account' = 'api';

    let error: string;

    const projectId = page.params.project;
    const organizationId = page.params.organization;

    function getLabel(): string {
        switch (keyType) {
            case 'api':
                return 'API';
            case 'dev':
                return 'dev';
            case 'organization':
                return 'organization';
            case 'account':
                return 'account';
        }
    }

    function getSlug(): string {
        switch (keyType) {
            case 'api':
                return 'api-keys';
            case 'dev':
                return 'dev-keys';
            case 'organization':
                return 'organization-keys';
            case 'account':
                return 'account-keys';
        }
    }

    function getEvent() {
        switch (keyType) {
            case 'api':
                return Submit.KeyDelete;
            case 'dev':
                return Submit.DevKeyDelete;
            case 'organization':
                return Submit.KeyDelete;
            case 'account':
                return Submit.KeyDelete;
        }
    }

    function getDependency() {
        switch (keyType) {
            case 'api':
                return Dependencies.KEYS;
            case 'dev':
                return Dependencies.DEV_KEYS;
            case 'organization':
                return Dependencies.ORGANIZATION;
            case 'account':
                return Dependencies.ACCOUNT;
        }
    }

    function deleteKey(keyId: string) {
        switch (keyType) {
            case 'api':
                return sdk.forConsole.projects.deleteKey({
                    projectId,
                    keyId
                });
            case 'dev':
                return sdk.forConsole.projects.deleteDevKey({
                    projectId,
                    keyId
                });
            case 'organization':
                return sdk.forConsole.organizations.deleteKey({
                    organizationId,
                    keyId
                });
            case 'account':
                return sdk.forConsole.account.deleteKey({
                    keyId
                });
        }
    }

    async function postDeleteRedirect() {
        switch (keyType) {
            case 'api':
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/overview/${slug}`
                );
                break;
            default:
                break;
        }
    }

    const label = getLabel();
    const slug = getSlug();
    const event = getEvent();
    const dependency = getDependency();

    async function handleDelete() {
        try {
            await Promise.all(keyIds.map((key) => deleteKey(key)));

            await invalidate(dependency);
            showDelete = false;

            addNotification({
                type: 'success',
                message: `${keyIds.length} ${label} key${keyIds.length > 1 ? 's' : ''} deleted`
            });

            trackEvent(event);

            postDeleteRedirect();
        } catch (e) {
            error = e.message;
            trackError(e, event);
        } finally {
            keyIds = [];
        }
    }
</script>

<Confirm
    bind:error
    bind:open={showDelete}
    submissionLoader
    onSubmit={handleDelete}
    title={`Delete ${label} key${keyIds.length > 1 ? 's' : ''}`}>
    <p>
        Are you sure you want to delete <b>{keyIds.length}</b>
        {label} key{keyIds.length > 1 ? 's' : ''}?
    </p>
</Confirm>
