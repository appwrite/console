<script lang="ts">
    export let disabled = false;
    export let selected = false;
    export let success = false;
    export let warning = false;
    export let danger = false;
    export let info = false;
    export let button = false;
    export let submit = false;
    export let external = false;
    export let href: string | null = null;
    export let trim = false;

    let element: HTMLButtonElement;

    const isOverflowing = (elem: HTMLButtonElement, iterator = 1) => {
        let parent = elem?.parentElement;
        if (!parent) return;
        if (
            trim &&
            elem &&
            elem.scrollWidth + 10 > (parent?.clientWidth ?? parent.parentElement?.clientWidth)
        )
            trimText(iterator);
        else return;
    };

    function trimText(iterator: number) {
        const childEl = element.childNodes[element.childElementCount];

        if (!childEl) return;

        if (iterator > 3) {
            childEl.textContent = '...';
        } else {
            let text = childEl.textContent;
            childEl.textContent = text?.slice(0, 3) + '...' + text?.slice(-9 + iterator * 2);
            isOverflowing(element, iterator + 1);
        }
    }

    $: isOverflowing(element);
</script>

{#if href}
    <a
        {...{ disabled }}
        {href}
        target={external ? '_blank' : '_self'}
        rel={external ? 'noopener noreferrer' : ''}
        class="tag"
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </a>
{:else if button}
    <button
        bind:this={element}
        on:click
        {disabled}
        type={submit ? 'submit' : 'button'}
        class="tag"
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </button>
{:else}
    <div
        class="tag"
        class:is-disabled={disabled}
        class:is-selected={selected}
        class:is-success={success}
        class:is-warning={warning}
        class:is-danger={danger}
        class:is-info={info}>
        <slot />
    </div>
{/if}
