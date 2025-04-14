<template>
  <UModal
    title="Log in"
    description="Please, log in to continue using the website.">
    <UButton
      :label="formType ? `New ${formType}` : 'Log In'"
      :variant="formType ? 'solid' : 'ghost'"
      :icon="formType ? 'lucide:plus' : 'lucide:key-round'"
      :color="formType ? 'primary' : 'neutral'"
      :class="{'w-full': !formType}" />

    <template #body>
      <div class="flex flex-col gap-4">
        <UButton
          to="/auth/google"
          external
          icon="tabler:brand-google"
          size="xl"
          color="neutral"
          variant="subtle">
          Sign in with Google
        </UButton>
        <UButton
          to="/auth/github"
          external
          icon="tabler:brand-github"
          size="xl"
          color="neutral"
          variant="subtle">
          Sign in with GitHub
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  formType?: string;
}>();
</script>
