<script lang="ts">
    import { Alert } from '$lib/components';
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
    import { createOrganization } from './store';

    let email: string;

    function addCollaborator() {
        if (!email) return;
        $createOrganization.collaborators.push(email);
        $createOrganization = $createOrganization;
        email = '';
    }

    function removeCollaborator(email: string) {
        $createOrganization.collaborators = $createOrganization.collaborators.filter(
            (collaborator) => collaborator !== email
        );
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Invite collaborators</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Invite team members to collaborate with you in the Appwrite console. Members will have
        access to all services and payment data within your organization.
    </svelte:fragment>

    <Alert type="info">
        {#if $createOrganization.billingPlan === 'tier-2'}
            You can add unlimited organization members on the Scale plan at no cost. Each member
            added will receive an email invite to your organization on completion.
        {:else if $createOrganization.billingPlan === 'tier-1'}
            You can add unlimited organization members on the Pro plan for $15 each. Each member
            added will receive an email invite to your organization on completion.
        {/if}
    </Alert>

    <div class="u-margin-block-start-24">
        <Form onSubmit={addCollaborator}>
            <FormList>
                <InputEmail
                    label="Email address"
                    id="email"
                    placeholder="Email address"
                    bind:value={email}
                    required>
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
                    {#if $createOrganization.billingPlan === 'tier-1'}
                        <TableCellHead width={80}>Cost</TableCellHead>
                    {/if}
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each $createOrganization.collaborators as collaborator}
                        <TableRow>
                            <TableCellText title="collaborator">{collaborator}</TableCellText>
                            {#if $createOrganization.billingPlan === 'tier-1'}
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
