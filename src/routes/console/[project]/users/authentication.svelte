<script lang="ts">
    import { Card } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';

    $: projectId = $project.$id;

    const authUpdate = async (id: string, value: boolean) => {
        try {
            await sdkForConsole.projects.updateAuthStatus(projectId, id, value);
            addNotification({
                type: 'success',
                message: 'Updated project auth status successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    let authBoxes = [
        {
            label: 'Password',
            id: 'email-password',
            value: $project.authEmailPassword
        },
        {
            label: 'Magic URL',
            id: 'magic-url',
            value: $project.authUsersAuthMagicURL
        },
        {
            label: 'Anonymous',
            id: 'anonymous',
            value: $project.authAnonymous
        },
        {
            label: 'Invites',
            id: 'invites',
            value: $project.authInvites
        },
        {
            label: 'JWT',
            id: 'jwt',
            value: $project.authJWT
        }
    ];

    console.log($project);
    //TODO: move authBoxes and providersBoxes to a store
    //TODO: if operation not successful revert switchbox value
</script>

<Container>
    <Card>
        <div>
            <h2 class="heading-level-6">Auth Methods</h2>
            <p>Enable the auth methods you wish to use.</p>
        </div>
        <ul class="">
            {#each authBoxes as box}
                <li class="form-item">
                    <label class="label" for={box.id}>{box.label}</label>
                    <div class="input-text-wrapper">
                        <input
                            label={box.label}
                            id={box.id}
                            type="checkbox"
                            class="switch"
                            role="switch"
                            bind:checked={box.value}
                            on:change={() => {
                                authUpdate(box.id, box.value);
                            }} />
                    </div>
                </li>
            {/each}
        </ul>
    </Card>
    <h2 class="heading-level-6 common-section">OAuth2 Providers</h2>
    <ul class="grid-box ">
        {#each authBoxes as provider}
            <button class="card u-flex u-flex-vertical u-cross-center">
                <div class="card-image">
                    <img
                        height="50"
                        width="50"
                        src={provider?.src || 'https://via.placeholder.com/50'}
                        alt={provider?.name} />
                </div>
                <p>{provider?.name}</p>
                <Pill>Inactive</Pill>
            </button>
        {/each}
    </ul>
</Container>
