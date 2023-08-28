<script>
    import { addSubPanel, registerCommands } from '$lib/commandCenter';
    import { TeamsPanel, UsersPanel } from '$lib/commandCenter/panels';
    import { Container } from '$lib/layout';
    import { loading } from '../store';

    loading.set(false);

    $registerCommands([
        {
            label: 'Find users',
            callback: () => {
                addSubPanel(UsersPanel);
            },
            group: 'users',
            rank: -1
        },
        {
            label: 'Find teams',
            callback: () => {
                addSubPanel(TeamsPanel);
            },
            group: 'teams',
            rank: -1
        }
    ]);
</script>

<Container>
    <slot />
</Container>
