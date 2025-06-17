<script lang="ts">
    import { Button, InputPassword } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Layout, Selector, Button as PinkButton } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let show = false;
    export let variables: Partial<Models.Variable>[];

    let newVariables: Partial<Models.Variable>[] = [{ key: '', value: '' }];
    let secret = false;
    let error = '';

    function handleVariable() {
        try {
            if (secret) {
                newVariables = newVariables.map((variable) => ({ ...variable, secret: true }));
            }

            newVariables.forEach((variable) => {
                if (('' + variable.value).length > 8192) {
                    throw new Error(
                        `Variable ${variable.key} is longer than 8192 allowed characters`
                    );
                }
            });
            const updatedVariables = [...variables];
            newVariables.forEach((newVar) => {
                if (!newVar.key) {
                    return;
                }
                const existingIndex = updatedVariables.findIndex((v) => v.key === newVar.key);
                if (existingIndex !== -1) {
                    updatedVariables[existingIndex] = {
                        ...updatedVariables[existingIndex],
                        ...newVar
                    };
                } else {
                    updatedVariables.push(newVar);
                }
            });

            variables = updatedVariables;
            show = false;
        } catch (e) {
            error = e.message;
        }
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

<Modal bind:show onSubmit={handleVariable} title="Create variables" bind:error>
    <span slot="description">
        Set the environment variables or secret that will be passed to your site. Global variables
        can be set in <Link variant="muted" href={getProjectRoute('/settings')}
            >project settings</Link
        >.
    </span>
    <Layout.Stack gap="xxl">
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
            size="s"
            id="secret"
            label="Secret"
            bind:checked={secret}
            description="If selected, you and your team won't be able to read the values after creation." />
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
