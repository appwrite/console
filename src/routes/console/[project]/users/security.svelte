<script>
    import { Card } from '$lib/components';
    import { Button, InputNumber } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { project } from '../store';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';

    const projectId = $project.$id;
    let isLimited = $project.authLimit === 0 ? 'unlimited' : 'limited';
    let newLimit = $project.authLimit === 0 ? 100 : $project.authLimit;
    let btnActive = false;
    let first = true;

    $: {
        if (isLimited) {
            if (first) {
                first = false;
            } else {
                btnActive = true;
            }
        }
    }

    async function updateLimit() {
        try {
            project.set(
                await sdkForConsole.projects.updateAuthLimit(
                    projectId,
                    isLimited === 'unlimited' ? 0 : newLimit
                )
            );
            btnActive = false;

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Container>
    <Card>
        <div class="u-flex u-main-space-between u-gap-12 common-section">
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h2 class="heading-level-6">Users Limit</h2>
                    <p>
                        This limits new users from signing up for your project, regardless of
                        authentication method. You can still create users from your Appwrite
                        console.
                    </p>
                </div>
            </div>
            <ul class="u-flex u-gap-12">
                <li>
                    <div class="input-text-wrapper">
                        <input
                            id="unlimited"
                            name="authLimit"
                            required
                            type="radio"
                            checked={isLimited === 'unlimited'}
                            bind:group={isLimited}
                            value="unlimited" />
                        <label class="label" for="unlimited">Unlimited</label>
                    </div>
                    <div class="input-text-wrapper">
                        <input
                            id="limited"
                            name="authLimit"
                            required
                            type="radio"
                            checked={isLimited === 'limited'}
                            bind:group={isLimited}
                            value="limited" />
                        <label class="label" for="limited">Limited</label>
                    </div>
                    <InputNumber
                        id="limit"
                        label=""
                        disabled={isLimited === 'unlimited'}
                        bind:value={newLimit} />
                </li>
            </ul>
        </div>
        <div class="u-flex u-main-space-end common-section">
            <Button
                disabled={!btnActive}
                on:click={() => {
                    updateLimit();
                }}>Update</Button>
        </div>
    </Card>

    <Card />
    <h7 class="heading-level-7">Session length</h7>
    <Card />
</Container>
