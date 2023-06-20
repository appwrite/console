<script lang="ts">
    import { Alert } from '$lib/components';
    import { Button, FormList, InputEmail } from '$lib/elements/forms';
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
        if ($createOrganization.collaborators.find((c) => c.email === email)) return;
        $createOrganization.collaborators = [
            ...$createOrganization.collaborators,
            {
                email,
                role: 'member'
            }
        ];
        email = '';
    }

    function removeCollaborator(email: string) {
        $createOrganization.collaborators = $createOrganization.collaborators.filter(
            (c) => c.email !== email
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
        {#if $createOrganization.tier === 'pro'}
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, quasi?
        {:else if $createOrganization.tier === 'starter'}
            You can add up to three organization members with the Starter plan for $10 each. Each
            member added will receive an email invite to your organization on completion.
        {:else}
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi quae aut dignissimos
            quod. Aut, omnis!
        {/if}
    </Alert>

    <FormList>
        <InputEmail
            label="Email address"
            id="email"
            placeholder="Email address"
            bind:value={email}
            required />
        <Button secondary on:click={addCollaborator}>Add</Button>
    </FormList>

    {#if $createOrganization?.collaborators?.length}
        <Table noStyles>
            <TableHeader>
                <TableCellHead>Collaborator</TableCellHead>
                <TableCellHead>Cost</TableCellHead>
                <TableCellHead>Admin</TableCellHead>
                <TableCellHead />
            </TableHeader>
            <TableBody>
                {#each $createOrganization.collaborators as collaborator}
                    <TableRow>
                        <TableCellText title="collaborator">{collaborator.email}</TableCellText>
                        <TableCellText title="cost">PRICE</TableCellText>
                        <TableCell>
                            <input type="checkbox" name="role" id={collaborator.email} />
                        </TableCell>
                        <TableCell>
                            <button
                                type="button"
                                class="button is-text is-only-icon"
                                style="--button-size:1.5rem;"
                                aria-label="remove collaborator"
                                on:click={removeCollaborator(collaborator.email)}>
                                <span class="icon-x" aria-hidden="true" />
                            </button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {/if}
</WizardStep>
