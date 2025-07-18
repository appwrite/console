<script>
  import { createAIContext } from '@ai-sdk/svelte';

  let { children } = $props();

  createAIContext();
  // all hooks created after this or in components that are children of this component
  // will have synchronized state
</script>

{@render children()}