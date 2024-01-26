<script lang="ts">
    import { Alert } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button, Form, FormList, InputEmail } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { WizardStep } from '$lib/layout';
    import { plansInfo } from '$lib/stores/billing';
    import { createOrganization } from './store';

    let email: string;

    function addCollaborator() {
        if (!email) return;
        if ($createOrganization.collaborators.includes(email)) return;
        $createOrganization.collaborators.push(email);
        $createOrganization = $createOrganization;
        email = '';
    }

    function removeCollaborator(email: string) {
        $createOrganization.collaborators = $createOrganization.collaborators.filter(
            (collaborator) => collaborator !== email
        );
    }

    const plan = $plansInfo?.get($createOrganization.billingPlan);
</script>

<WizardStep>
    <svelte:fragment slot="title">Invite organization members</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Invite team members to collaborate with you in the Appwrite console. Members will have
        access to all services and payment data within your organization.
    </svelte:fragment>

    <Alert type="info">
        {#if $createOrganization.billingPlan === BillingPlan.SCALE}
            You can add unlimited organization members on the {plan.name} plan at no cost. Each member
            added will receive an email invite to your organization on completion.
        {:else if $createOrganization.billingPlan === BillingPlan.PRO}
            You can add unlimited organization members on the {plan.name} plan for
            <b>${plan.addons.member.price} each per month</b>. Each member added will receive an
            email invite to your organization on completion.
        {/if}
    </Alert>

    <div class="u-margin-block-start-24">
        <Form onSubmit={addCollaborator}>
            <FormList>
                <InputEmail
                    label="Email address"
                    id="email"
                    placeholder="Email address"
                    bind:value={email}>
                    <Button secondary submit>Add</Button>
                </InputEmail>
            </FormList>
        </Form>
    </div>

    {#if $createOrganization?.collaborators?.length}
        <div class="u-margin-block-start-24">
            <Table noStyles noMargin>
                <TableHeader>
                    <TableCellHead>Collaborator</TableCellHead>
                    {#if $createOrganization.billingPlan === BillingPlan.PRO}
                        <TableCellHead width={80}>Cost</TableCellHead>
                    {/if}
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each $createOrganization.collaborators as collaborator}
                        <TableRow>
                            <TableCellText title="collaborator">{collaborator}</TableCellText>
                            {#if $createOrganization.billingPlan === BillingPlan.PRO}
                                <TableCellText title="cost">15$</TableCellText>
                            {/if}
                            <TableCell>
                                <button
                                    type="button"
                                    class="button is-text is-only-icon"
                                    style="--button-size:1.5rem;"
                                    aria-label="remove collaborator"
                                    on:click={() => removeCollaborator(collaborator)}>
                                    <span class="icon-x" aria-hidden="true" />
                                </button>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
    {/if}
</WizardStep>
