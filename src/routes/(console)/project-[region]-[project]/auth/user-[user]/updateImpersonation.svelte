<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert, Layout, Link, Selector } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { user } from './store';

    type UserWithImpersonation = Models.User<Record<string, string>> & {
        impersonation?: boolean;
    };

    type UsersWithImpersonationApi = {
        updateImpersonation(params: {
            userId: string;
            impersonation: boolean;
        }): Promise<UserWithImpersonation>;
    };

    let impersonation = false;
    let lastLoadedUserId: string = null;

    // TODO: Remove this cast once the installed console SDK exposes impersonation types.
    $: currentImpersonation = Boolean(($user as UserWithImpersonation)?.impersonation);

    $: if ($user?.$id && $user.$id !== lastLoadedUserId) {
        impersonation = currentImpersonation;
        lastLoadedUserId = $user.$id;
    }

    async function updateImpersonation() {
        try {
            await (
                sdk.forProject(page.params.region, page.params.project)
                    .users as unknown as UsersWithImpersonationApi
            ).updateImpersonation({
                userId: $user.$id,
                impersonation
            });

            await invalidate(Dependencies.USER);

            addNotification({
                message: `Impersonation capability has been ${impersonation ? 'enabled' : 'disabled'}`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateImpersonation);
        } catch (error) {
            impersonation = currentImpersonation;

            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateImpersonation);
        }
    }
</script>

<CardGrid hideFooter>
    <svelte:fragment slot="title">User impersonation</svelte:fragment>
    Control whether this user can impersonate other users through your app using the Appwrite Client SDK&apos;s
    impersonation support.
    <Link.Anchor
        target="_blank"
        rel="noopener noreferrer"
        href="https://appwrite.io/docs/products/auth">
        Documentation
    </Link.Anchor>
    <svelte:fragment slot="aside">
        <Layout.Stack gap="m">
            <Selector.Switch
                id="user-impersonation"
                bind:checked={impersonation}
                label="Impersonation capability"
                description={`This user ${impersonation ? 'can' : 'cannot'} impersonate others`}
                on:change={updateImpersonation} />

            <Alert.Inline status="info" title="Note">
                Grant this only for trusted operator or support-style accounts. Audit logs still
                attribute actions to the account that started impersonation, not only the
                impersonated user.
            </Alert.Inline>
        </Layout.Stack>
    </svelte:fragment>
</CardGrid>
