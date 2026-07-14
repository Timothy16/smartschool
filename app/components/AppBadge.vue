<script setup lang="ts">
import { badgeClasses, type UiColor } from '~/utils/styleVariants'

withDefaults(defineProps<{ color?: UiColor }>(), { color: 'neutral' })
</script>

<template>
  <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium" :class="badgeClasses(color)">
    <slot />
  </span>
</template>
