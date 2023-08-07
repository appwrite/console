<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $project.$id;

    let isLimited = $project.authLimit !== 0;
    let newLimit = isLimited ? $project.authLimit : 100;

    $: btnDisabled = (function isBtnDisabled() {
        if (
            (!isLimited && $project.authLimit === 0) ||
            (isLimited && $project.authLimit === newLimit)
        ) {
            return true;
        }

        return false;
    })();

    async function updateLimit() {
        try {
            await sdk.forConsole.projects.updateAuthLimit(projectId, isLimited ? newLimit : 0);
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: $LL.components.notification.projectUserLimitUpdated()
            });
            trackEvent(Submit.AuthLimitUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthLimitUpdate);
        }
    }
</script>

<CardGrid>
    <Heading tag="h2" size="7">{$LL.console.project.title.security.usersLimit()}</Heading>
    <p>
        {$LL.console.project.texts.security.usersLimit()}
    </p>

    <svelte:fragment slot="aside">
        <ul class="form-list">
            <li class="form-item">
                <label class="choice-item" for="unlimited">
                    <input
                        id="unlimited"
                        name="authLimit"
                        class="u-cross-child-center"
                        required
                        type="radio"
                        bind:group={isLimited}
                        value={false} />
                    <div class="choice-item-content u-cross-child-center">
                        <div class="choice-item-title">
                            {$LL.console.project.texts.security.unlimited()}
                        </div>
                    </div>
                    <Pill>{$LL.console.project.table.pill.recommended()}</Pill>
                </label>
            </li>
            <li class="form-item is-multiple">
                <div class="input-text-wrapper">
                    <label class="choice-item" for="limited">
                        <input
                            id="limited"
                            name="authLimit"
                            required
                            type="radio"
                            bind:group={isLimited}
                            value={true} />
                        <div class="choice-item-content">
                            <div class="choice-item-title">
                                {$LL.console.project.texts.security.limited()}
                            </div>
                        </div>
                    </label>
                </div>
                <div
                    class="input-text-wrapper u-stretch"
                    on:click={() => (isLimited = true)}
                    on:keyup|self={clickOnEnter}>
                    <input
                        type="number"
                        name="limit"
                        id="limit"
                        class="input-text"
                        max="10000"
                        disabled={!isLimited}
                        bind:value={newLimit} />
                </div>
            </li>
        </ul>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={btnDisabled}
            on:click={() => {
                updateLimit();
            }}>
            {$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</CardGrid>
