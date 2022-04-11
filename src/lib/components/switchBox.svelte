<script lang="ts">
    export let label: string;
    export let id: string;
    export let src: string;
    export let alt: string = '';
    export let href: string = '';
    export let linkText: string = 'Docs';
    export let value = false;
    export let required = false;
    export let disabled = false;
</script>

<li class="card">
    <label class="switch-box" for={id}>
        <div class="switch-box-image">
            <img height="50" width="50" {src} {alt} />
        </div>
        <span class="switch-box-title">{label}</span>
        {#if href.length}
            <a {href} class="link" target="_blank">
                <span class="text">{linkText}</span>
                <span class="icon-link-ext" aria-hidden="true" />
            </a>
        {/if}
        <input
            {id}
            {disabled}
            {required}
            type="checkbox"
            class="switch"
            role="switch"
            bind:checked={value} />
    </label>
</li>
