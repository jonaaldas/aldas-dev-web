<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Filters — only shown if there's data -->
    <div v-if="tabs.length > 0" class="mx-auto flex max-w-3xl gap-2 px-6 py-4">
      <Button
        v-for="tab in tabs"
        :key="tab.id"
        variant="ghost"
        size="sm"
        class="h-7 rounded-full px-3 text-xs"
        :class="
          activeTab === tab.id
            ? 'bg-primary/10 text-foreground font-semibold ring-1 ring-primary/20'
            : 'text-muted-foreground'
        "
        @click="setTab(tab.id)"
        >{{ tab.label }}</Button
      >
    </div>

    <!-- Grid -->
    <div
      v-if="tabs.length > 0 && activeTab === 'content'"
      class="mx-auto max-w-3xl columns-1 gap-3 px-6 pb-16 sm:columns-2 lg:columns-3"
    >
      <component
        :is="'a'"
        v-for="item in contentItems"
        :key="item.id"
        :href="item.href"
        target="_blank"
        class="mb-3 block break-inside-avoid"
      >
        <Card class="group overflow-hidden transition-shadow hover:shadow-md">
          <div v-if="item.thumbnail" class="relative aspect-video overflow-hidden bg-muted">
            <img
              :src="item.thumbnail"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div
              class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
                <span class="text-sm text-foreground">&#9654;</span>
              </div>
            </div>
          </div>
          <CardContent class="flex items-start justify-between gap-2 p-3">
            <p class="text-sm font-medium leading-snug">{{ item.title }}</p>
            <Badge class="shrink-0 text-[10px] font-semibold" :class="item.badgeClass">{{ item.source }}</Badge>
          </CardContent>
        </Card>
      </component>
    </div>

    <div
      v-else-if="tabs.length > 0"
      class="mx-auto max-w-3xl columns-1 gap-3 px-6 pb-16 sm:columns-2 lg:columns-3"
    >
      <component
        :is="item.href ? 'a' : 'div'"
        v-for="item in projectItems"
        :key="item.id"
        :href="item.href"
        :target="item.href ? '_blank' : undefined"
        class="mb-3 block break-inside-avoid"
      >
        <Card class="transition-shadow hover:shadow-md">
          <CardHeader class="space-y-1.5 p-3 pb-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 rounded-full"
                  :class="
                    item.status === 'LIVE'
                      ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                      : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                  "
                />
                <CardTitle class="text-sm">{{ item.title }}</CardTitle>
              </div>
              <Badge variant="secondary" class="text-[10px] font-medium text-indigo-600">Project</Badge>
            </div>
          </CardHeader>
          <CardContent class="p-3 pt-1.5">
            <p class="text-xs leading-relaxed text-muted-foreground">{{ item.description }}</p>
            <div v-if="item.tech.length > 0" class="mt-3 flex flex-wrap gap-1">
              <Badge
                v-for="t in item.tech"
                :key="t"
                variant="outline"
                class="text-[10px] font-normal text-muted-foreground"
                >{{ t }}</Badge
              >
            </div>
          </CardContent>
        </Card>
      </component>
    </div>

    <!-- Footer -->
    <Separator />
    <footer class="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
      <span class="text-xs text-muted-foreground/50">{{ new Date().getFullYear() }} aldas.dev</span>
      <span class="text-xs text-muted-foreground/50">Made by Aldas 🚀</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSiteData } from '@/composables/useSiteData';

const { about, projects, socialContent } = useSiteData();

const route = useRoute();
const router = useRouter();

type TabId = 'project' | 'content';
type ProjectCardItem = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  status: string;
  href?: string;
};
type ContentCardItem = {
  id: string;
  title: string;
  source: string;
  badgeClass: string;
  thumbnail?: string;
  href: string;
};

// Badge styles per social platform
const badgeStyles: Record<string, string> = {
  YouTube: 'bg-[#ff0000] text-white border-transparent',
  TikTok: 'bg-[#000000] text-white border-transparent',
  Twitter: 'bg-[#000000] text-white border-transparent',
  Instagram: 'bg-[#e1306c] text-white border-transparent',
  LinkedIn: 'bg-[#0a66c2] text-white border-transparent',
  Twitch: 'bg-[#9146ff] text-white border-transparent',
};

// Map data from collections
const projectItems = computed<ProjectCardItem[]>(() =>
  projects.map((p, i: number) => ({
    id: `proj-${i}`,
    title: p.title,
    description: p.description,
    tech: p.tech,
    status: p.status,
    href: p.links?.website || p.links?.github || undefined,
  }))
);

const contentItems = computed<ContentCardItem[]>(() =>
  socialContent.map((c, i: number) => ({
    id: `content-${i}`,
    source: c.source,
    badgeClass: badgeStyles[c.source] || '',
    title: c.title,
    thumbnail: c.thumbnail || '',
    href: c.url,
  }))
);

// Only show tabs that have data
const allTabs = [
  { id: 'project', label: 'Projects', items: projectItems },
  { id: 'content', label: 'On the Web', items: contentItems },
] as const;

const tabs = computed(() => allTabs.filter((t) => t.items.value.length > 0));

const defaultTab = computed<TabId>(() => tabs.value[0]?.id || 'project');
const initialTab = computed<TabId>(() => {
  const q = route.query.tab as TabId | undefined;
  if (q && tabs.value.some((t) => t.id === q)) {
    return q;
  }

  return defaultTab.value;
});

const activeTab = ref<TabId>(initialTab.value);

function setTab(id: TabId) {
  activeTab.value = id;
  router.replace({ query: { tab: id } });
}

</script>
