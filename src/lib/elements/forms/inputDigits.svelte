<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { FormItem } from '.';
    import { createPinInput, melt } from '@melt-ui/svelte';
    import Body from '../table/body.svelte';

    export let length: number = 6;
    export let value: string = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let fullWidth = false;

    let element: HTMLOListElement;

    let autoSubmitted = false;

    const {
        elements: { root, input }
    } = createPinInput({
        placeholder: '',
        defaultValue: value.split(''),
        onValueChange: ({ next }) => {
            value = next.join('');

            if (value.length === 6 && !autoSubmitted) {
                autoSubmitted = true;
                const firstInputElement = element.querySelector('input');
                firstInputElement?.form.requestSubmit();
            }

            return next;
        }
    });

    /**
     * TODO: Find proper solution.
     * This spams focus for half a second.
     * Autofocus works properly if +layout.ts is ssr = false. Seems like Svelte Kit bug.
     * Using document.hasFocus doesnt help here
     */
    async function focusInput(i = 0) {
        if (i >= 10) {
            return;
        }

        if (element && autofocus) {
            element.querySelector('input')?.focus();
        }

        await tick();

        setTimeout(() => {
            focusInput(i + 1);
        }, 50);
    }

    onMount(() => {
        focusInput();
    });
</script>

<FormItem {fullWidth}>
    <ol class="u-flex u-main-center u-gap-16" use:melt={$root} bind:this={element}>
        {#each Array.from({ length }) as _}
            <li>
                <input
                    type="number"
                    class="verification-code-input u-remove-input-number-buttons"
                    maxlength="1"
                    style:--p-input-size="3.75rem"
                    style:font-size="2rem"
                    use:melt={$input()}
                    {required}
                    {readonly}
                    {disabled} />
            </li>
        {/each}
    </ol>
</FormItem>
