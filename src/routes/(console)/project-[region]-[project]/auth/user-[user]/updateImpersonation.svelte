<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert, Layout, Link, Selector, Typography } from '@appwrite.io/pink-svelte';
    import { user } from './store';

    let impersonator = false;
    let lastLoadedUserId: string = null;

    $: currentImpersonator = Boolean($user?.impersonator);

    $: if ($user?.$id && $user.$id !== lastLoadedUserId) {
        impersonator = currentImpersonator;
        lastLoadedUserId = $user.$id;
    }

    async function updateImpersonator() {
        try {
            const projectSdk = sdk.forProject(page.params.region, page.params.project);

            if (typeof projectSdk.users.updateImpersonator === 'function') {
                await projectSdk.users.updateImpersonator({
                    userId: $user.$id,
                    impersonator
                });
            } else {
                const apiPath = `/users/${$user.$id}/impersonator`;
                const uri = new URL(projectSdk.client.config.endpoint + apiPath);

                await projectSdk.client.call(
                    'patch',
                    uri,
                    {
                        'content-type': 'application/json'
                    },
                    {
                        impersonator
                    }
                );
            }

            await invalidate(Dependencies.USER);

            addNotification({
                message: `Impersonation capability has been ${impersonator ? 'enabled' : 'disabled'}`,
                type: 'success'
            });
            trackEvent(Submit.UserUpdateImpersonation);
        } catch (error) {
            impersonator = currentImpersonator;

            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateImpersonation);
        }
    }
</script>

<Form onSubmit={updateImpersonator}>
    <CardGrid>
        <svelte:fragment slot="title">User impersonation</svelte:fragment>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <Selector.Switch
                    id="user-impersonation"
                    bind:checked={impersonator}
                    label="User impersonation">
                    <svelte:fragment slot="description">
                        <div class="u-margin-block-start-8">
                            <Typography.Text variant="m-400">
                                Enabling this option allows this user to impersonate other users
                                through your app using the Appwrite Client SDK.
                                <Link.Anchor
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://appwrite.io/docs/products/auth">
                                    Learn more.
                                </Link.Anchor>
                            </Typography.Text>
                        </div>
                    </svelte:fragment>
                </Selector.Switch>

                <Alert.Inline status="info">
                    Only grant this permission to trusted operator or support accounts. Actions are
                    logged under the account that initiated impersonation.
                </Alert.Inline>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={impersonator === currentImpersonator} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
