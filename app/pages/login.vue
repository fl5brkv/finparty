<template>
  <button @click="openInPopup('/auth/google')">sign in with google</button>
  <button @click="openInPopup('/auth/github')">sign in with github</button>
</template>

<script setup lang="ts">
const {openInPopup} = useUserSession();
</script>
