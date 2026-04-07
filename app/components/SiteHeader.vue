<template>
  <header class="mx-auto max-w-3xl px-5 pt-10 pb-8 sm:px-6 sm:pt-16">
    <div class="flex items-start justify-between gap-4 sm:gap-6">
      <div>
        <NuxtLink v-if="titleTo" :to="titleTo" class="transition-colors hover:text-muted-foreground">
          <h1 class="text-2xl font-bold tracking-tight sm:text-4xl">{{ title }}</h1>
        </NuxtLink>
        <h1 v-else class="text-2xl font-bold tracking-tight sm:text-4xl">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>

      <div class="hidden flex-wrap items-center gap-3 pt-2 sm:flex">
        <nav class="flex flex-wrap gap-3">
          <a
            v-for="link in allLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            :aria-label="linkLabel(link.icon)"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <component v-if="link.iconComponent" :is="link.iconComponent" class="h-4 w-4" aria-hidden="true" />
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"
              />
            </svg>
          </a>
        </nav>

        <NuxtLink v-for="action in actions" :key="action.to" :to="action.to">
          <Button :variant="action.variant" size="sm" class="h-7 gap-1.5 rounded-full px-3 font-mono text-[11px]">
            <span v-if="action.prefix" :class="action.prefixClass">{{ action.prefix }}</span>
            {{ action.label }}
          </Button>
        </NuxtLink>
      </div>

      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-border sm:hidden"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation menu"
        @click="menuOpen = !menuOpen"
      >
        <svg
          v-if="!menuOpen"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>

    <div v-if="menuOpen" class="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:hidden">
      <div class="flex flex-wrap gap-3">
        <a
          v-for="link in allLinks"
          :key="`mobile-${link.url}`"
          :href="link.url"
          target="_blank"
          :aria-label="linkLabel(link.icon)"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
        >
          <component v-if="link.iconComponent" :is="link.iconComponent" class="h-4 w-4" aria-hidden="true" />
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"
            />
          </svg>
        </a>
      </div>
      <Separator />
      <NuxtLink
        v-for="action in mobileActions"
        :key="`mobile-${action.to}`"
        :to="action.to"
        class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span v-if="action.prefix" :class="['font-mono', action.prefixClass]">{{ action.prefix }}</span>
        {{ action.label }}
      </NuxtLink>
    </div>

    <p v-if="description" class="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{{ description }}</p>
  </header>
</template>

<script setup lang="ts">
import { computed, markRaw, ref } from 'vue';
import { FileText, Github, Mail } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { AboutData, SiteLinkIconName } from '@/data/types';

type HeaderAction = {
  label: string;
  to: string;
  variant?: 'ghost' | 'outline';
  prefix?: string;
  prefixClass?: string;
};

const props = withDefaults(
  defineProps<{
    about: AboutData;
    title: string;
    subtitle?: string;
    description?: string;
    titleTo?: string;
    actions?: HeaderAction[];
    mobileActions?: HeaderAction[];
  }>(),
  {
    subtitle: undefined,
    description: undefined,
    titleTo: undefined,
    actions: () => [],
    mobileActions: () => [],
  }
);

const menuOpen = ref(false);
const iconMap = {
  github: markRaw(Github),
  email: markRaw(Mail),
  resume: markRaw(FileText),
} as const;

const allLinks = computed(() =>
  (props.about.links || []).map((link) => ({
    ...link,
    iconComponent: link.icon === 'x' ? null : iconMap[link.icon],
  }))
);

function linkLabel(icon: SiteLinkIconName) {
  switch (icon) {
    case 'x':
      return 'X';
    case 'github':
      return 'GitHub';
    case 'email':
      return 'Email';
    case 'resume':
      return 'Resume';
  }
}
</script>
