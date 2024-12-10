<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, CustomId, Modal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { isCloud } from '$lib/system';
    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';
    import { upgradeURL } from '$lib/stores/billing';
    import CreatePolicy from './database-[database]/backups/createPolicy.svelte';
    import { cronExpression, type UserBackupPolicy } from '$lib/helpers/backups';
    import { page } from '$app/stores';

    export let showCreate = false;
    let totalPolicies: UserBackupPolicy[] = [];

    const dispatch = createEventDispatcher();

    let name = '';
    let id: string = null;
    let showCustomId = false;
    let showPlanUpgradeAlert = true;

    const trackEvents = (policies) => {
        policies.forEach((policy) => {
            let actualDay = null;
            const monthlyBackupFrequency = policy.monthlyBackupFrequency;
            switch (monthlyBackupFrequency) {
                case 'first':
                    actualDay = '1st';
                    break;
                case 'middle':
                    actualDay = '15th';
                    break;
                case 'end':
                default:
                    actualDay = '28th';
                    break;
            }

            const message = {
                keepFor: `${policy.retained} days`,
                frequency: policy.plainTextFrequency,
                policy: policy.default ? 'preset' : 'custom'
            };

            if (actualDay) message['monthlyInterval'] = actualDay;

            trackEvent('submit_policy_submit', message);
        });
    };

    const createPolicies = async (resourceId: string) => {
        if (!totalPolicies.length) return;

        const totalPoliciesPromise = totalPolicies.map((policy) => {
            cronExpression(policy);

            return sdk
                .forProject($page.params.region, $page.params.project)
                .backups.createPolicy(
                    ID.unique(),
                    ['databases'],
                    policy.retained,
                    policy.schedule,
                    policy.label,
                    resourceId
                );
        });

        await Promise.all(totalPoliciesPromise);
        trackEvents(totalPolicies);
    };

    const create = async () => {
        try {
            const databaseId = id ? id : ID.unique();
            const database = await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.create(databaseId, name);
            await createPolicies(databaseId);

            showCreate = false;
            dispatch('created', database);
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            trackEvent(Submit.DatabaseCreate, {
                customId: !!id
            });
            name = id = null;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseCreate);
        }
    };

    $: if (!showCreate) {
        showPlanUpgradeAlert = true;
    }
</script>

<Modal title="Create database" size="big" onSubmit={create} bind:show={showCreate}>
    <FormList gap={8}>
        <InputText
            id="name"
            label="Name"
            placeholder="Enter database name"
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Database ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Database" bind:id autofocus={false} />
        {/if}

        {#if isCloud}
            <div class="u-flex-vertical u-gap-24 u-padding-block-start-24">
                {#if $organization?.billingPlan === BillingPlan.FREE}
                    {#if showPlanUpgradeAlert}
                        <Alert
                            type="warning"
                            dismissible
                            on:dismiss={() => (showPlanUpgradeAlert = false)}>
                            <svelte:fragment slot="title"
                                >This database won't be backed up
                            </svelte:fragment>
                            Upgrade your plan to ensure your data stays safe and backed up.
                            <svelte:fragment slot="buttons">
                                <Button href={$upgradeURL} text>Upgrade plan</Button>
                            </svelte:fragment>
                        </Alert>
                    {/if}
                {:else}
                    <CreatePolicy
                        bind:totalPolicies
                        bind:isShowing={showCreate}
                        title="Backup policies"
                        subtitle="Protect your data and ensure quick recovery by adding backup policies." />
                {/if}
            </div>
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
