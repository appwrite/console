<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Card, Heading } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { tierToPlan, type Tier, plansInfo, isOrganization } from '$lib/stores/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { base } from '$app/paths';
    import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';

    let name: string;
    let plan: Tier;

    const options = isCloud
        ? [
              {
                  value: BillingPlan.FREE,
                  label: `${tierToPlan(BillingPlan.FREE).name} - ${formatCurrency($plansInfo.get(BillingPlan.FREE).price)} / month`
              },
              {
                  value: BillingPlan.PRO,
                  label: `${tierToPlan(BillingPlan.PRO).name} - ${formatCurrency($plansInfo.get(BillingPlan.PRO).price)} / month + add-ons`
              },
              {
                  value: BillingPlan.SCALE,
                  label: `${tierToPlan(BillingPlan.SCALE).name} - ${formatCurrency($plansInfo.get(BillingPlan.SCALE).price)}/month + usage`
              }
          ]
        : [];

    onMount(() => {
        if (isCloud) {
            checkPricingRefAndRedirect($page.url.searchParams);
        }
    });

    async function handleSubmit() {
        const orgName = name?.length ? name : 'Personal Projects';
        if (isCloud) {
            if (plan === BillingPlan.FREE) {
                try {
                    const org = await sdk.forConsole.billing.createOrganization(
                        ID.unique(),
                        orgName,
                        plan,
                        null,
                        null
                    );
                    trackEvent(Submit.OrganizationCreate, {
                        plan: tierToPlan(plan)?.name
                    });
                    await invalidate(Dependencies.ACCOUNT);
                    if (isOrganization(org)) {
                        await goto(`${base}/organization-${org.$id}`);
                        addNotification({
                            message: `${orgName} organization successfully created`,
                            type: 'success'
                        });
                    } else {
                        addNotification({
                            message: `${org.message}`,
                            type: 'error'
                        });
                    }
                } catch (error) {
                    addNotification({
                        message: error.message,
                        type: 'error'
                    });
                    trackError(error, Submit.OrganizationCreate);
                }
            } else {
                goto(`${base}/create-organization?name=${orgName}&plan=${plan}`);
            }
        } else {
            try {
                const org = await sdk.forConsole.teams.create(ID.unique(), orgName);

                await invalidate(Dependencies.ACCOUNT);
                await goto(`${base}/organization-${org.$id}`);

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
