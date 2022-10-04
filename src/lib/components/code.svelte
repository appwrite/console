<script context="module">
    import 'highlight.js/scss/default.scss';
</script>

<script lang="ts">
    import Highlight from 'highlight.js';
    import { onMount } from 'svelte';

    let container: HTMLElement;
    onMount(() => {
        Highlight.highlightElement(container);
    });
</script>

<pre><code class="language-js" bind:this={container}><slot /></code></pre>
