<script lang="ts">
    import { Button, InputPassword } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { project } from './store';
    import { base } from '$app/paths';
    import { Alert, Layout, Selector, Button as PinkButton, Icon } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    export let isGlobal: boolean;
    export let product: 'function' | 'site' = 'function';
    export let showCreate = false;
    let newVariables: Partial<Models.Variable>[] = [{ key: '', value: '' }];
    let secret = false;

    const dispatch = createEventDispatcher();

    function close() {
        showCreate = false;
    }

    function handleVariable() {
        if (secret) {
            newVariables = newVariables.map((variable) => ({ ...variable, secret: true }));
        }
        newVariables.forEach((variable) => {
            if (('' + variable.value).length > 8192) {
                throw new Error(`Variable ${variable.key} is longer than 8192 allowed characters`);
            }
        });
        dispatch('created', newVariables);
        close();
    }

    function removeVariable(index: number) {
        if (newVariables.length === 1) {
            newVariables[0].key = '';
            newVariables[0].value = '';
        } else {
            newVariables.splice(index, 1);
            newVariables = [...newVariables];
        }
    }
</script>

<Modal
    bind:show={showCreate}
    onSubmit={handleVariable}
    title={`Create' ${isGlobal ? 'global' : 'environment'} variable`}>
    <svelte:fragment slot="description">
        <span>
            Set the environment variables or secret keys that will be passed to {!isGlobal
                ? `your ${product}`
                : `all functions and sites within your project`}.
        </span>
    </svelte:fragment>
    <Layout.Stack>
        {#if !isGlobal}
            <Alert.Inline>
                When there is a naming conflict with a global variable in your <Link
                    href={`${base}/project-${$project.$id}/settings/variables`}>
                    project settings</Link>
                and a {product} environment variable, the global variable will be ignored.
            </Alert.Inline>
        {/if}
        <Layout.Stack gap="xs">
            {#each newVariables as pair, i}
                <Layout.Stack direction="row" gap="s" alignItems="flex-end" inline>
                    <InputText
                        id="key"
                        label={`${i === 0 ? 'Key' : ''}`}
                        placeholder="ENTER_KEY"
                        bind:value={pair.key}
                        autocomplete={false}
                        autofocus />
                    <InputPassword
                        id="value"
                        label={`${i === 0 ? 'Value' : ''}`}
                        placeholder="Enter value"
                        bind:value={pair.value}
                        minlength={0} />
                    <PinkButton.Button
                        icon
                        variant="secondary"
                        type="button"
                        size="s"
                        disabled={newVariables.length === 1 && !pair.key && !pair.value}
                        on:click={() => removeVariable(i)}>
                        <Icon icon={IconX} />
                    </PinkButton.Button>
                </Layout.Stack>
            {/each}
            <div>
                <Button
                    text
                    compact
                    disabled={newVariables.some((pair) => !pair.key)}
                    on:click={() => (newVariables = [...newVariables, { key: '', value: '' }])}>
                    <Icon slot="start" icon={IconPlus} />Add variable</Button>
            </div>
        </Layout.Stack>
        <Selector.Checkbox
            id="secret"
            label="Secret"
            bind:checked={secret}
            description="If selected, you and your team won't be able to read the values after creation." />
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
