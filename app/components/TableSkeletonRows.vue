<script setup lang="ts">
withDefaults(
  defineProps<{
    columns: number
    rows?: number
  }>(),
  { rows: 5 }
)
</script>

<template>
  <tr v-for="row in rows" :key="row" class="border-b border-line-soft last:border-0">
    <td v-for="col in columns" :key="col" class="px-5 py-3">
      <AppSkeleton :width="col === 1 ? '70%' : '50%'" />
    </td>
  </tr>
</template>
