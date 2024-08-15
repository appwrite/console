<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';
    import { createPinInput, melt } from '@melt-ui/svelte';
    import { page } from '$app/stores';
    import { sleep } from '$lib/helpers/promises';

    export let length: number = 6;
    export let value: string = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let fullWidth = false;
    export let autoSubmit = true;

    let element: HTMLOListElement;

    let autoSubmitted = false;

    const {
        elements: { root, input }
    } = createPinInput({
        placeholder: '',
        defaultValue: value.split(''),
        onValueChange: ({ next }) => {
            value = next.join('');

            if (value.length < length) {
                autoSubmitted = false;
            }

            if (element && autoSubmit && value.length === length && !autoSubmitted) {
                autoSubmitted = true;
                const firstInputElement = element.querySelector('input');
                firstInputElement?.form.requestSubmit();
            }

            return next;
        }
    });

    /**
     * Clears the input fields and moves the focus to the first input.
     * Usually used when resetting fields on auth fails, etc.
     */
    export function clearInputsAndRefocus() {
        value = '';

        if (element) {
            const inputs = element.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            if (autofocus) inputs[0].focus();
        }
    }

    async function focusDigitInputs() {
        /**
         * this is to re-focus the inputs that feels natural
         * as the blinking of the cursor takes around 250ms.
         */
        await sleep(250);

        const interval = setInterval(() => {
            const input = element.querySelector('input');
            if (element) {
                /**
                 * Ensure the value is empty before refocusing.
                 *
                 * If the value is not cleared and the form is submitted,
                 * the cursor will move to the first field while the last field remains filled.
                 * This would cause the focus to appear visually odd and very inconsistent.
                 */
                if (input && autofocus && value === '') {
                    input.focus();
                }
                clearInterval(interval);
            }
        }, 10);
    }

    onMount(() => {
        /**
         * Inputs will lose focus on any change.
         * Changes include the url & query params like `?redirect=`.
         *
         * This subscription ensures that focus is restored when needed.
         */
        return page.subscribe(() => {
            focusDigitInputs();
        });
    });
</script>

<FormItem {fullWidth}>
    <ol class="u-flex u-main-center" use:melt={$root} bind:this={element}>
        {#each Array.from({ length }) as _}
            <li>
                <input
                    type="number"
                    class="verification-code-input u-bold u-remove-input-number-buttons"
                    inputmode="numeric"
                    maxlength="1"
                    style:border-radius="var(--border-radius-small)"
                    use:melt={$input()}
                    {required}
                    {readonly}
                    {disabled} />
            </li>
        {/each}
    </ol>
</FormItem>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';

    /* Default (including mobile) */
    ol {
        gap: 0.5rem;

        input {
            --p-input-size: 2.5rem;
            font-size: 1rem;
        }
    }

    /* for smaller screens */
    @media #{$break2open} {
        ol {
            gap: 1rem;

            input {
                --p-input-size: 3.75rem;
                font-size: 2rem;
            }
        }
    }
</style>
