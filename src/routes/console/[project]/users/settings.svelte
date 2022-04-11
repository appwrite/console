<script>
    import { SwitchBox } from '$lib/components';
    import { Container } from '$lib/layout';

    let email_password = true;

    //@todo : add SwitchBox click logic
</script>

<Container>
    <h1>Settings</h1>
    <p>Choose auth methods you wish to use.</p>
    <ul class="grid-box">
        <SwitchBox
            label="Email/Password"
            id="notifications"
            src="https://via.placeholder.com/50"
            href="https://appwrite.io/docs/client/account?sdk=web-default#accountCreateSession"
            value={email_password} />
    </ul>
</Container>
