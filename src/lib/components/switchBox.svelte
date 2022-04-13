<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    type SwitchBox = {
        label: string;
        id: string;
        src: string;
        alt: string;
        href: string;
        linkText: string;
        value: boolean;
        required: boolean;
        disabled: boolean;
        wip: boolean;
    };

    export let box: SwitchBox;

    let { label, id, src, alt, href, linkText, disabled, required, value, wip } = box;

    const dispatch = createEventDispatcher();

    //@todo move SwitchBox type outside  component
</script>

<li class="card">
    <label class="switch-box" for={id}>
        <div class="switch-box-image">
            <img height="50" width="50" src={src || 'https://via.placeholder.com/50'} {alt} />
        </div>
        <span class="switch-box-title">{label}</span>
        {#if !wip}
            <a {href} class="link" target="_blank">
                <span class="text">{linkText || 'Docs'} </span>
                <span class="icon-link-ext" aria-hidden="true" />
            </a>
            <input
                {id}
                {disabled}
                {required}
                type="checkbox"
                class="switch"
                role="switch"
                bind:checked={value}
                on:change={() => dispatch('updated', { value, id })} />
        {/if}
    </label>
</li>
