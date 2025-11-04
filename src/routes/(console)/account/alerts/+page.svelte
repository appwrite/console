<script>
    import { CardGrid } from "$lib/components";
    import { InputChoice } from "$lib/elements/forms";
    import { Container } from "$lib/layout";
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { Layout } from "@appwrite.io/pink-svelte";

    let deploymentFailedEmailAlert = $user.prefs.deploymentFailedEmailAlert ?? true;

    function toggleDeploymentFailedEmailAlert() {
      deploymentFailedEmailAlert = !deploymentFailedEmailAlert;
      const newPrefs = {
        ...$user.prefs,
        deploymentFailedEmailAlert: deploymentFailedEmailAlert
      };
      sdk.forConsole.account.updatePrefs({ prefs: newPrefs });
    }

</script>

<Container>
  <CardGrid>
    <svelte:fragment slot="title">Email Alerts</svelte:fragment>
    Toggle email preferences to receive notifications when certain events occur.

    <svelte:fragment slot="aside">
      <Layout.Stack gap="xl">
        <InputChoice
            on:change={toggleDeploymentFailedEmailAlert}
            type="switchbox"
            id="mfa"
            label="Deployment Failed"
            value={deploymentFailedEmailAlert} />
      </Layout.Stack>
    </svelte:fragment>
  </CardGrid>
</Container>