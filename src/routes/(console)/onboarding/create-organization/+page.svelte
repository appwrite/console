<script lang="ts">
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { BillingPlan } from '$lib/constants';
    import { tierToPlan } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { loadAvailableRegions } from '$routes/(console)/regions';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Button, Card, Layout, Input, Typography, Spinner } from '@appwrite.io/pink-svelte';
    import { Form } from '$lib/elements/forms/index.js';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    let isLoading = false;
    let organizationName = 'Personal Projects';

    async function createOrganization() {
        isLoading = true;
        let organization = null;

        try {
            if (isCloud) {
                organization = await sdk.forConsole.billing.createOrganization(
                    ID.unique(),
                    organizationName,
                    BillingPlan.FREE,
                    null,
                    null
                );

                trackEvent(Submit.OrganizationCreate, {
                    plan: tierToPlan(BillingPlan.FREE)?.name,
                    budget_cap_enabled: false,
                    members_invited: 0
                });
            } else {
                organization = await sdk.forConsole.teams.create(ID.unique(), organizationName);
            }
        } catch (e) {
            trackError(e, Submit.OrganizationCreate);
            addNotification({
                type: 'error',
                message: e.message
            });
        } finally {
            isLoading = false;
            if (organization) {
                loadAvailableRegions(organization?.$id).then();
                await goto(`${base}/organization-${organization.$id}`);
            }
        }
    }
</script>

<svelte:head>
    <title>Create organization - Appwrite</title>
</svelte:head>

<Form onSubmit={createOrganization}>
    <div class="viewport-center">
        <div class="page-container u-cross-child-center">
            <Card.Base variant="primary" padding="l">
                <Layout.Stack direction="column" gap="xxl" alignItems="flex-start">
                    <Typography.Title size="l">Create an organization</Typography.Title>

                    <Input.Text
                        required
                        disabled={isLoading}
                        label="Organization name"
                        bind:value={organizationName}
                        placeholder="Personal Projects" />

                    <Layout.Stack direction="row" justifyContent="flex-end">
                        <Button.Button
                            size="s"
                            autofocus
                            type="submit"
                            variant="primary"
                            disabled={isLoading}>
                            {#if isLoading}
                                <Spinner size="s" />
                            {/if}
                            Create
                        </Button.Button>
                    </Layout.Stack>
                </Layout.Stack>
            </Card.Base>
        </div>
    </div>
</Form>

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';

    :global(body) {
        margin: 0;
        background: var(--bgcolor-neutral-default, #19191c);
    }

    .viewport-center {
        height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .page-container {
        width: calc(100% - 2rem);

        @media #{devices.$break2open} {
            width: 700px;
        }
    }
</style>
