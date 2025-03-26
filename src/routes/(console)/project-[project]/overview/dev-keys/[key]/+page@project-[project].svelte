<script lang="ts">
    import { devKey } from './store';
    import KeyDetails from '../../(components)/keyDetails.svelte';
</script>

<KeyDetails key={$devKey} keyType="dev" />
