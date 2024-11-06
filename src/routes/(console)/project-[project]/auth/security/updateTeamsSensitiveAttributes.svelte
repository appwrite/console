<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    let authTeamsSensitiveAttributes = $project?.teamsSensitiveAttributes ?? true;

    async function updateTeamsSensitiveAttributes() {
        try {
            await sdk.forConsole.projects.updatePersonalDataCheck(
                $project.$id,
                authTeamsSensitiveAttributes
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Toggled teams sensitive attributes'
            });
            trackEvent(Submit.AuthTeamsSensitiveAttributesUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthTeamsSensitiveAttributesUpdate);
        }
    }
</script>

<Form onSubmit={updateTeamsSensitiveAttributes}>
    <CardGrid>
        <Heading tag="h2" size="7" id="personal-data">Teams sensitive attributes</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={authTeamsSensitiveAttributes}
                    id="teamsSensitiveAttributes"
                    label="Show sensitive attributes in teams" />
            </FormList>
            <p class="text">
                When enabled, sensitive attributes are provided in team membership response model.
                This includes the <code>userName</code>, <code>userEmail</code>, and
                <code>mfa</code> attributes.
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={authTeamsSensitiveAttributes === $project?.teamsSensitiveAttributes}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
