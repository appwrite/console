<script lang="ts">
    import { key } from './store';
    import KeyDetails from '../../(components)/keyDetails.svelte';
</script>

<KeyDetails key={$key} keyType="api" />
