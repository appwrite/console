<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let href: string;
    export let icon: string = null;
    export let disabled = false;

    //allows to add the disabled attribute to <a> tag without throwing an error
    let attributes = { disabled } as Record<string, boolean>;
</script>

<li class="drop-list-item" on:click on:keyup={clickOnEnter}>
    <a {href} class="drop-button" {...attributes}>
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
    </a>
</li>
