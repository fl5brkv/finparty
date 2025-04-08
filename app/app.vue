<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <div class="flex">
      <div class="w-64 h-screen bg-gray-800 text-white">
        <div class="p-4 text-xl font-bold">Dashboard</div>
        <ul class="space-y-4 mt-8">
          <li>
            <NuxtLink href="/clients" class="block px-4 py-2 hover:bg-gray-700"
              >Clients</NuxtLink
            >
          </li>
          <li>
            <NuxtLink href="/transactions" class="block px-4 py-2 hover:bg-gray-700"
              >Transactions</NuxtLink
            >
          </li>
        </ul>
      </div>

      <div class="flex-1 bg-gray-100 p-8">
        <NuxtPage />
      </div>
    </div>
  </UApp>
</template>
