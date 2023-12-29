<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Card, Heading } from '$lib/components';
    import CustomId from '$lib/components/customId.svelte';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import CreateOrganizationCloud from '../createOrganizationCloud.svelte';
    import { tierToPlan, type Tier } from '$lib/stores/billing';
    import { createOrganization } from '../wizard/cloudOrganization/store';

    let name: string;
    let id: string;
    let showCustomId = false;
    let plan: Tier;

    const options = [
        { value: BillingPlan.STARTER, label: 'Starter - $0/month' },
        { value: BillingPlan.PRO, label: 'Pro - $15/month + add-ons' }
    ];

    onMount(() => {
        if (isCloud) {
            if ($page.url.searchParams.has('type')) {
                const paramType = $page.url.searchParams.get('type');
                if (paramType === 'createPro') {
                    wizard.start(CreateOrganizationCloud);
                }
            }
        }
    });

    async function handleSubmit() {
        const orgName = name?.length ? name : 'Personal Projects';
        if (isCloud) {
            if (plan === BillingPlan.STARTER) {
                try {
                    const org = await sdk.forConsole.billing.createOrganization(
                        id ?? ID.unique(),
                        orgName,
                        plan,
                        null,
                        null
                    );
                    trackEvent(Submit.OrganizationCreate, {
                        customId: !!id,
                        plan: tierToPlan(plan)?.name
                    });
                    await invalidate(Dependencies.ACCOUNT);
                    await goto(`/console/organization-${org.$id}`);
                    addNotification({
                        message: `${orgName} organization successfully created`,
                        type: 'success'
                    });
                } catch (error) {
                    addNotification({
                        message: error.message,
                        type: 'error'
                    });
                    trackError(error, Submit.OrganizationCreate);
                }
            } else {
                wizard.start(CreateOrganizationCloud, null, 2);
                $createOrganization.name = orgName;
                $createOrganization.billingPlan = plan;
                $createOrganization.id = id;
            }
        } else {
            try {
                const org = await sdk.forConsole.teams.create(id ?? ID.unique(), orgName);

                await invalidate(Dependencies.ACCOUNT);
                await goto(`/console/organization-${org.$id}`);

                addNotification({
                    message: `${orgName} organization successfully created`,
                    type: 'success'
                });
            } catch (error) {
                addNotification({
                    message: error.message,
                    type: 'error'
                });
                trackError(error, Submit.OrganizationCreate);
            }
        }
    }
</script>

<Container overlapCover size="large">
    <Card>
        <Heading size="4" tag="h2">Create a new organization</Heading>
        <Form onSubmit={handleSubmit}>
            <FormList gap={16}>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Organization name"
                    hideRequired
                    bind:value={name} />
                {#if !showCustomId}
                    <div>
                        <Pill button on:click={() => (showCustomId = !showCustomId)}>
                            <span class="icon-pencil" aria-hidden="true" /><span class="text">
                                Organization ID
                            </span>
                        </Pill>
                    </div>
                {:else}
                    <CustomId bind:show={showCustomId} name="Organization" isProject bind:id />
                {/if}
                {#if isCloud}
                    <div class="u-margin-block-start-8">
                        <h3><b>Plan</b></h3>
                        <p>
                            For more details on our plans, visit our <Button
                                link
                                external
                                href="https://appwrite.io/pricing">pricing page</Button
                            >.
                        </p>
                        <FormList class="u-margin-block-start-8">
                            <InputSelect
                                placeholder="Select a plan"
                                label="Select plan"
                                showLabel={false}
                                id="plan"
                                required
                                hideRequired
                                {options}
                                bind:value={plan} />
                        </FormList>
                    </div>
                {/if}
                <Button
                    fullWidth
                    submit
                    disabled={isCloud && !plan}
                    event="create_organization"
                    submissionLoader
                    let:isSubmitting>
                    {#if isSubmitting}
                        Creating your first organization
                    {:else}
                        Get started
                    {/if}
                </Button>
            </FormList>
        </Form>
    </Card>
</Container>
