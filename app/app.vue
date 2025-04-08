<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <div class="flex">
      <aside
        class="w-64 py-3.5 px-3 h-screen flex flex-col border-r border-(--ui-border)">
        <UButton
          icon="noto:partying-face"
          variant="ghost"
          color="neutral"
          label="Finparty"
          class="w-full mb-2.5"
          to="/clients" />

        <UNavigationMenu :items="links[0]" orientation="vertical" color="neutral" />

        <div class="mt-auto">
          <UDropdownMenu
            :items="items"
            v-if="loggedIn"
            :ui="{
              content: 'w-57',
            }">
            <UButton
              v-bind="{
                ...user,
                label: user?.name,
                trailingIcon: 'lucide:chevrons-up-down',
              }"
              variant="ghost"
              block
              color="neutral"
              class="data-[state=open]:bg-(--ui-bg-elevated)"
              :ui="{
                trailingIcon: 'text-(--ui-text-dimmed)',
              }"
              :avatar="{
                src: user?.img,
              }" />
          </UDropdownMenu>

          <div v-else>
            <UModal
              title="Log in"
              description="Please, log in to continue using the website.">
              <UButton
                label="Log in"
                variant="ghost"
                icon="lucide:key-round"
                color="neutral"
                class="w-full" />

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
          </div>
        </div>
      </aside>

      <div class="flex-1">
        <NuxtPage />
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const {user, clear, loggedIn} = useUserSession();

const toast = useToast();

import type {NavigationMenuItem, DropdownMenuItem} from '@nuxt/ui';

const links = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Clients',
      icon: 'lucide:user',
      to: '/clients',
    },
    {
      label: 'Transactions',
      icon: 'lucide:circle-dollar-sign',
      to: '/transactions'
    },
  ],
]);

const colorMode = useColorMode();

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value?.name,
      avatar: {src: user.value?.img},
    },
  ],
  [
    {
      label: 'Appearance',
      icon: 'tabler:sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'tabler:sun-high',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = 'light';
          },
        },
        {
          label: 'Dark',
          icon: 'tabler:moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = 'dark';
            }
          },
          onSelect(e: Event) {
            e.preventDefault();
          },
        },
      ],
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'lucide:log-out',
      onSelect() {
        clear();
        toast.add({
          title: 'Success',
          description: 'Succesfully logged out!',
        });
      },
    },
    {
      label: 'Delete account',
      icon: 'lucide:trash',
      onSelect() {
        clear();
        toast.add({
          title: 'Success',
          description: 'The account was deleted.',
          color: 'error',
        });
      },
    },
  ],
]);
</script>
