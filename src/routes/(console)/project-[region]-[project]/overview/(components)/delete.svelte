<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { type Models } from '@appwrite.io/console';
    import { goto, invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let showDelete = false;
    export let keyType: 'api' | 'dev' | 'organization' | 'account' = 'api';
    export let key: Models.DevKey | Models.Key;

    const projectId = page.params.project;

    function getLabel() {
        switch (keyType) {
            case 'api':
                return 'API key';
            case 'dev':
                return 'Dev key';
            case 'organization':
                return 'Organization key';
            case 'account':
                return 'Account token';
        }
    }

    function getSlug() {
        switch (keyType) {
            case 'api':
                return 'api-keys';
            case 'dev':
                return 'dev-keys';
            case 'organization':
                return 'organization-keys';
            case 'account':
                return 'account-tokens';
        }
    }

    function getEvent() {
        switch (keyType) {
            case 'api':
                return Submit.KeyDelete;
            case 'dev':
                return Submit.DevKeyDelete;
            case 'organization':
                return Submit.OrganizationKeyDelete;
            case 'account':
                return Submit.AccountTokenDelete;
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

    function getRedirectPath() {
        switch (keyType) {
            case 'api':
            case 'dev':
                return `${base}/project-${page.params.region}-${page.params.project}/overview/${getSlug()}`;
            case 'organization':
                return `${base}/organization-${page.params.organization}/integrations`;
            case 'account':
                return `${base}/account/integrations`;
        }
    }

    let error: string;

    async function handleDelete() {
        try {
            switch (keyType) {
                case 'api':
                    await sdk.forConsole.projects.deleteKey({
                        projectId,
                        keyId: key.$id
                    });
                    break;
                case 'dev':
                    await sdk.forConsole.projects.deleteDevKey({
                        projectId,
                        keyId: key.$id
                    });
                    break;
                case 'organization':
                    await sdk.forConsole.organizations.deleteKey({
                        organizationId: page.params.organization,
                        keyId: key.$id
                    });
                    break;
                case 'account':
                    await sdk.forConsole.account.deleteKey({
                        keyId: key.$id
                    });
                    break;
            }

            await invalidate(getDependency());
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${key.name} has been deleted`
            });
            trackEvent(getEvent());
            await goto(getRedirectPath());
        } catch (e) {
            error = e.message;
            trackError(e, getEvent());
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete {getLabel()}" bind:open={showDelete} bind:error>
    Are you sure you want to delete this key?
</Confirm>
