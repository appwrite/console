<script lang="ts">
    export let href: string;
    export let title: string;

    export let external = false;
    export let noStyle = false;
</script>

<div class="table-col" data-title={title} role="cell" data-private>
    <a
        role="button"
        tabindex="0"
        class:link={!noStyle}
        {href}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}><slot /></a>
</div>
