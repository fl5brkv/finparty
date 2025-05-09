<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <div class="flex">
      <div
        v-if="opened"
        @click="opened = false"
        class="fixed inset-0 bg-(--ui-bg-elevated)/75 animate-[fade-in_200ms_ease-out] lg:hidden z-5"></div>

      <aside
        class="fixed md:static flex flex-col h-screen bg-[var(--ui-bg)] py-4 px-3 border-r border-[var(--ui-border)] transition-transform ease-in-out duration-300 z-10 max-w-sm w-full md:w-64 md:py-4.5"
        :class="{'invisible md:visible': !opened, visible: opened}">
        <div class="flex items-center gap-0.5 mb-3.5">
          <UButton
            :icon="opened ? 'lucide:x' : 'lucide:menu'"
            size="md"
            color="neutral"
            variant="ghost"
            @click="opened = !opened"
            class="md:hidden" />

          <UButton
            icon="noto:partying-face"
            variant="ghost"
            color="neutral"
            label="Finparty"
            to="/clients"
            class="flex-1" />
        </div>

        <UNavigationMenu
          :items="links[0]"
          orientation="vertical"
          color="neutral" />

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
            <MyLogin />
          </div>
        </div>
      </aside>

      <div
        class="flex-1 transition-all duration-300"
        :class="{'lg:ml-72': opened, 'lg:ml-0': !opened}">
        <NuxtPage />
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const {user, clear, loggedIn} = useUserSession();

const toast = useToast();

const opened = ref(false);

provide('opened', {
  opened,
  toggle: () => (opened.value = !opened.value),
});

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
      to: '/transactions',
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
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = 'light';
          },
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
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
