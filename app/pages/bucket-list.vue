<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="mx-auto max-w-3xl px-5 pt-10 pb-8 sm:px-6 sm:pt-16">
      <div class="flex items-start justify-between gap-4 sm:gap-6">
        <div>
          <NuxtLink to="/" class="transition-colors hover:text-muted-foreground">
            <h1 v-if="about?.name" class="text-2xl font-bold tracking-tight sm:text-4xl">{{ about.name }}</h1>
          </NuxtLink>
          <p class="mt-1 text-sm text-muted-foreground">Bucket list, in public.</p>
        </div>
        <div class="home-desktop-nav hidden flex-wrap items-center gap-3 pt-2 sm:flex" v-if="about">
          <nav class="flex flex-wrap gap-3">
            <a
              v-for="link in allLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              class="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >{{ link.label }}</a
            >
          </nav>
          <NuxtLink to="/">
            <Button variant="ghost" size="sm" class="h-7 rounded-full px-3 font-mono text-[11px]">home</Button>
          </NuxtLink>
          <NuxtLink to="/cli">
            <Button variant="outline" size="sm" class="h-7 gap-1.5 rounded-full px-3 font-mono text-[11px]">
              <span class="text-green-600">&gt;_</span> cli
            </Button>
          </NuxtLink>
        </div>
        <button
          class="home-mobile-toggle flex h-9 w-9 items-center justify-center rounded-lg border border-border sm:hidden"
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
      <div
        v-if="menuOpen && about"
        class="home-mobile-menu mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:hidden"
      >
        <a
          v-for="link in allLinks"
          :key="`mobile-${link.url}`"
          :href="link.url"
          target="_blank"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >{{ link.label }}</a
        >
        <Separator />
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span class="font-mono">~/</span> home
        </NuxtLink>
        <NuxtLink
          to="/cli"
          class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span class="font-mono text-green-600">&gt;_</span> terminal mode
        </NuxtLink>
      </div>
      <p class="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        A living list of things I want to do, build, and experience. Same site, same language, just a more personal
        tab.
      </p>
    </header>

    <Separator class="mx-auto max-w-3xl" />

    <main class="mx-auto max-w-3xl px-6 py-4">
      <div class="mb-4 flex gap-2">
        <Button variant="ghost" size="sm" class="h-7 rounded-full px-3 text-xs text-muted-foreground">
          {{ bucketList?.length || 0 }} items
        </Button>
      </div>

      <Card class="overflow-hidden">
        <CardContent class="p-0">
          <div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-border px-4 py-3 md:grid">
            <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">What I want</p>
            <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">How it&apos;s going</p>
            <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-right">Status</p>
          </div>

          <div
            v-for="item in bucketList"
            :key="item.id"
            class="grid gap-4 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <div>
              <p class="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:hidden">What I want</p>
              <p class="text-sm font-medium leading-snug">{{ item.title }}</p>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ item.want }}</p>
            </div>

            <div>
              <p class="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:hidden">How it&apos;s going</p>
              <p class="text-sm leading-relaxed text-muted-foreground">{{ item.progress }}</p>
            </div>

            <div class="flex items-start md:justify-end">
              <Badge :class="statusClass(item.status)" class="shrink-0 text-[10px] font-medium">
                {{ item.status }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>

    <!-- Footer -->
    <Separator />
    <footer class="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
      <span class="text-xs text-muted-foreground/50">{{ new Date().getFullYear() }} aldas.dev</span>
      <span class="text-xs text-muted-foreground/50">Made by Aldas 🚀</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const menuOpen = ref(false);

useHead({
  style: [
    {
      key: 'bucket-list-header-first-paint',
      children: `
        .home-desktop-nav { display: none; }
        .home-mobile-toggle { display: flex; }
        @media (min-width: 640px) {
          .home-desktop-nav { display: flex; }
          .home-mobile-toggle { display: none; }
          .home-mobile-menu { display: none !important; }
        }
      `,
    },
  ],
});

useSeoMeta({
  title: 'Bucket List | aldas.dev',
  description: 'A simple list of things I want to do and how they are progressing.',
});

const { data: about } = await useAsyncData('bucket-list-about', () => queryCollection('about').first());
const { data: bucketList } = await useAsyncData('bucket-list', () =>
  queryCollection('bucketList').order('order', 'ASC').all()
);

const allLinks = computed(() => about.value?.links || []);

function statusClass(status: string) {
  switch (status) {
    case 'Done':
      return 'bg-emerald-100 text-emerald-700';
    case 'Booked':
      return 'bg-sky-100 text-sky-700';
    case 'In Progress':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}
</script>
