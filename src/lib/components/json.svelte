<script lang="ts">
    import Code from './code.svelte';

    export let code: string;
</script>

<Code showLineNumbers showCopy language="json" {code} />
