<script setup lang="ts">
import { buttonClasses, type UiColor, type ButtonVariant, type UiSize } from '~/utils/styleVariants'

const props = withDefaults(
  defineProps<{
    to?: string
    type?: 'button' | 'submit'
    color?: UiColor
    variant?: ButtonVariant
    size?: UiSize
    icon?: string
    trailingIcon?: string
    loading?: boolean
    disabled?: boolean
    block?: boolean
    square?: boolean
  }>(),
  {
    type: 'button',
    color: 'brand',
    variant: 'solid',
    size: 'md',
    block: false,
    square: false
  }
)

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : 'button'))

const classes = computed(() => [
  'inline-flex items-center justify-center font-medium transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-2',
  'disabled:opacity-50 disabled:pointer-events-none',
  buttonClasses(props.color, props.variant, props.size),
  props.block ? 'w-full' : '',
  props.square ? 'aspect-square px-0' : ''
])
</script>

<template>
  <component
    :is="tag"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="!to && (disabled || loading)"
    :class="classes"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="size-4 animate-spin" :class="{ '-ml-0.5': !square }" />
    <Icon v-else-if="icon" :name="icon" class="size-4" :class="{ '-ml-0.5': !square }" />
    <slot />
    <Icon v-if="trailingIcon && !loading" :name="trailingIcon" class="size-4 -mr-0.5" />
  </component>
</template>
