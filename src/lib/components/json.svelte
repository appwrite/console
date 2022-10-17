<script lang="ts">
    import Code from './code.svelte';

    export let code: string;
</script>

<Code withLineNumbers withCopy language="json" {code} />
