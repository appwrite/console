<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { trackError, trackEvent, Submit } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    const tierOptions = [
        { value: 's-1vcpu-1gb', label: 'Starter - 1 vCPU, 1 GB RAM' },
        { value: 's-2vcpu-2gb', label: 'Standard - 2 vCPU, 2 GB RAM' },
        { value: 's-2vcpu-4gb', label: 'Standard Plus - 2 vCPU, 4 GB RAM' },
        { value: 's-4vcpu-8gb', label: 'Pro - 4 vCPU, 8 GB RAM' },
        { value: 's-4vcpu-16gb', label: 'Pro Plus - 4 vCPU, 16 GB RAM' },
        { value: 's-4vcpu-32gb', label: 'Business - 4 vCPU, 32 GB RAM' },
        { value: 's-8vcpu-32gb', label: 'Business Plus - 8 vCPU, 32 GB RAM' },
        { value: 's-8vcpu-64gb', label: 'Enterprise - 8 vCPU, 64 GB RAM' }
    ];

    const tierResources: Record<string, { cpu: number; memory: number }> = {
        's-1vcpu-1gb': { cpu: 1, memory: 1024 },
        's-2vcpu-2gb': { cpu: 2, memory: 2048 },
        's-2vcpu-4gb': { cpu: 2, memory: 4096 },
        's-4vcpu-8gb': { cpu: 4, memory: 8192 },
        's-4vcpu-16gb': { cpu: 4, memory: 16384 },
        's-4vcpu-32gb': { cpu: 4, memory: 32768 },
        's-8vcpu-32gb': { cpu: 8, memory: 32768 },
        's-8vcpu-64gb': { cpu: 8, memory: 65536 }
    };

    let selectedTier: string = $state(database.tier);

    async function updateTier() {
        try {
            const resources = tierResources[selectedTier];
            if (!resources) {
                throw new Error('Invalid tier selected');
            }

            await sdk.forProject(page.params.region, page.params.project).compute.updateDatabase({
                databaseId: database.$id,
                cpu: resources.cpu,
                memory: resources.memory
            });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Resource tier has been updated. Scaling may take a few minutes.',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateTier);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateTier);
        }
    }
</script>

<Form onSubmit={updateTier}>
    <CardGrid>
        <svelte:fragment slot="title">Resource scaling</svelte:fragment>
        Change the compute resources allocated to your database. Scaling may cause a brief interruption
        while the database restarts.
        <svelte:fragment slot="aside">
            <InputSelect
                id="tier"
                label="Resource tier"
                bind:value={selectedTier}
                options={tierOptions} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={selectedTier === database.tier} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
