<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-page p-4">
    <!-- Ambient gradient background: brand-only, kept quiet - status colours are never decorative -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-40 -left-32 size-[28rem] rounded-full bg-brand-500/25 blur-3xl" />
      <div class="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-brand-300/20 blur-3xl" />
      <div
        class="absolute inset-0 opacity-40 dark:opacity-15"
        style="background-image: radial-gradient(circle, rgb(148 163 184 / 0.4) 1px, transparent 1px); background-size: 24px 24px;"
      />
    </div>

    <Transition
      appear
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
    >
      <div class="w-full max-w-md">
        <slot />
      </div>
    </Transition>
  </div>
</template>
