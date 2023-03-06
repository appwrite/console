<script lang="ts">
    import { DropList } from '$lib/components';
    import { onMount } from 'svelte';
    import { FormItem, Label } from '.';

    export let id: string;
    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let value: string | number | boolean;
    export let search: string = null;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let debounce = 250;
    export let options: {
        value: string | boolean | number;
        label: string;
    }[];

    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;
    let hasFocus = false;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const valueChange = (event: Event) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const target = event.target as HTMLInputElement;
            search = target.value;
        }, debounce);
    };
</script>

<li class="u-position-relative form-item">
    <DropList
        bind:show={hasFocus}
        noStyle
        noArrow
        scrollable
        placement="bottom-end"
        position="static"
        fullWidth={true}>
        <Label {required} {optionalText} hide={!showLabel} for={id}>
            {label}
        </Label>

        <div class="custom-select">
            <div class="select u-width-full-line">
                <input
                    type="text"
                    class="input-text"
                    {placeholder}
                    {disabled}
                    {required}
                    bind:value={search}
                    bind:this={element}
                    on:focus={() => (hasFocus = true)}
                    on:input={valueChange} />
                <span class="icon-cheveron-down" aria-hidden="true" />
            </div>
        </div>
        <svelte:fragment slot="list">
            {#each options as option}
                <li class="drop-list-item">
                    <button
                        class="drop-button"
                        type="button"
                        on:click|preventDefault={() => (value = option.value)}>
                        <span class="text">{option.label}</span>
                    </button>
                </li>
            {/each}
        </svelte:fragment>
    </DropList>
</li>
