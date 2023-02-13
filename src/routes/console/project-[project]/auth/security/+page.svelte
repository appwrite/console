<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdateSessionLength from './updateSessionLength.svelte';
    import UpdateSessionsLimit from './updateSessionsLimit.svelte';
    import UpdateUsersLimit from './updateUsersLimit.svelte';
</script>

<Container>
    <UpdateUsersLimit />
    <UpdateSessionLength />
    <UpdateSessionsLimit />
</Container>
