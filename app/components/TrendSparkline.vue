<script setup lang="ts">
// Renders in whatever text color the caller applies via `class` (e.g.
// text-danger-600) - the SVG uses currentColor so it stays theme/status aware
// without a chart library.
const props = withDefaults(defineProps<{ points: number[]; height?: number }>(), { height: 32 })

const path = computed(() => {
  if (props.points.length < 2) return ''
  const step = 100 / (props.points.length - 1)
  return props.points
    .map((value, i) => {
      const x = i * step
      const y = props.height - (Math.min(Math.max(value, 0), 100) / 100) * props.height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

function pointY(value: number) {
  return (props.height - (Math.min(Math.max(value, 0), 100) / 100) * props.height).toFixed(1)
}

function pointX(i: number) {
  return (i * (100 / (props.points.length - 1))).toFixed(1)
}
</script>

<template>
  <svg
    v-if="points.length >= 2"
    :viewBox="`0 0 100 ${height}`"
    preserveAspectRatio="none"
    class="w-full"
    :style="{ height: `${height}px` }"
  >
    <path :d="path" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" />
    <circle v-for="(value, i) in points" :key="i" :cx="pointX(i)" :cy="pointY(value)" r="2" fill="currentColor" />
  </svg>
  <p v-else class="text-xs text-ink-subtle">Not enough data yet</p>
</template>
