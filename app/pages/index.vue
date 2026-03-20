<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="mx-auto max-w-3xl px-6 pt-16 pb-8">
      <div class="flex items-start justify-between gap-6">
        <div>
          <h1 class="text-4xl font-bold tracking-tight">{{ about?.name || 'Jonathan' }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ about?.role }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 pt-2" v-if="about">
          <nav class="flex flex-wrap gap-3">
            <a
              v-for="link in allLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              class="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >{{ link.label }}</a>
          </nav>
          <NuxtLink to="/cli">
            <Button variant="outline" size="sm" class="h-7 gap-1.5 rounded-full px-3 font-mono text-[11px]">
              <span class="text-green-600">&gt;_</span> cli
            </Button>
          </NuxtLink>
        </div>
      </div>
      <p class="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{{ about?.summary }}</p>
    </header>

    <Separator class="mx-auto max-w-3xl" />

    <!-- Filters — only shown if there's data -->
    <div v-if="tabs.length > 0" class="mx-auto flex max-w-3xl gap-2 px-6 py-4">
      <Button
        v-for="tab in tabs"
        :key="tab.id"
        variant="ghost"
        size="sm"
        class="h-7 rounded-full px-3 text-xs"
        :class="activeTab === tab.id ? 'bg-primary/10 text-foreground font-semibold ring-1 ring-primary/20' : 'text-muted-foreground'"
        @click="setTab(tab.id)"
      >{{ tab.label }}</Button>
    </div>

    <!-- Grid -->
    <div v-if="tabs.length > 0" class="mx-auto max-w-3xl columns-1 gap-3 px-6 pb-16 sm:columns-2 lg:columns-3">
      <component
        :is="item.href ? 'a' : item.to ? 'NuxtLink' : 'div'"
        v-for="item in filteredItems"
        :key="item.id"
        :href="item.href"
        :to="item.to"
        :target="item.href ? '_blank' : undefined"
        class="mb-3 block break-inside-avoid"
      >
        <!-- Content card (YouTube, TikTok, etc.) -->
        <Card v-if="item.type === 'content'" class="group overflow-hidden transition-shadow hover:shadow-md">
          <div v-if="item.thumbnail" class="relative aspect-video overflow-hidden bg-muted">
            <img
              :src="item.thumbnail"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
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

        <!-- Project -->
        <Card v-else-if="item.type === 'project'" class="transition-shadow hover:shadow-md">
          <CardHeader class="space-y-1.5 p-3 pb-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 rounded-full"
                  :class="item.status === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]'"
                />
                <CardTitle class="text-sm">{{ item.title }}</CardTitle>
              </div>
              <Badge variant="secondary" class="text-[10px] font-medium text-indigo-600">Project</Badge>
            </div>
          </CardHeader>
          <CardContent class="p-3 pt-1.5">
            <p class="text-xs leading-relaxed text-muted-foreground">{{ item.description }}</p>
            <div class="mt-3 flex flex-wrap gap-1" v-if="item.tech">
              <Badge v-for="t in item.tech" :key="t" variant="outline" class="text-[10px] font-normal text-muted-foreground">{{ t }}</Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Blog / Interest -->
        <Card v-else-if="item.type === 'post'" class="group transition-shadow hover:shadow-md">
          <CardContent class="flex min-h-[120px] flex-col justify-center p-4">
            <span class="mb-2 font-mono text-lg text-muted-foreground/40 transition-colors group-hover:text-primary">{{ item.icon }}</span>
            <p class="text-sm font-medium leading-snug">{{ item.title }}</p>
            <p class="mt-1 text-xs text-muted-foreground">{{ item.description }}</p>
            <Badge variant="secondary" class="mt-3 w-fit text-[10px] font-medium text-pink-600">Blog</Badge>
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
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const { data: about } = await useAsyncData('about', () => queryCollection('about').first())
const { data: projects } = await useAsyncData('projects', () => queryCollection('projects').order('order', 'ASC').all())
const { data: posts } = await useAsyncData('posts', () => queryCollection('blog').order('date', 'DESC').all())
const { data: socialContent } = await useAsyncData('content', () => queryCollection('content').order('order', 'ASC').all())

const allLinks = computed(() => [
  ...(about.value?.links || []),
  { label: 'resume', url: '/resume.pdf' },
])

const route = useRoute()
const router = useRouter()

// Badge styles per social platform
const badgeStyles: Record<string, string> = {
  YouTube: 'bg-[#ff0000] text-white border-transparent',
  TikTok: 'bg-[#000000] text-white border-transparent',
  Twitter: 'bg-[#000000] text-white border-transparent',
  Instagram: 'bg-[#e1306c] text-white border-transparent',
  LinkedIn: 'bg-[#0a66c2] text-white border-transparent',
  Twitch: 'bg-[#9146ff] text-white border-transparent',
}

// Map data from collections
const projectItems = computed(() =>
  (projects.value || []).map((p: any, i: number) => ({
    id: `proj-${i}`,
    type: 'project',
    title: p.title,
    description: p.description,
    tech: p.tech,
    status: p.status,
    href: p.links?.website || p.links?.github || undefined,
  }))
)

const postItems = computed(() =>
  (posts.value || []).map((p: any) => ({
    id: `post-${p.path}`,
    type: 'post',
    title: p.title,
    description: p.description,
    icon: p.icon || '>',
    to: p.path,
  }))
)

const contentItems = computed(() =>
  (socialContent.value || []).map((c: any, i: number) => ({
    id: `content-${i}`,
    type: 'content',
    source: c.source,
    badgeClass: badgeStyles[c.source] || '',
    title: c.title,
    thumbnail: c.thumbnail || '',
    href: c.url,
  }))
)

// Only show tabs that have data
const allTabs = [
  { id: 'project', label: 'Projects', items: projectItems },
  { id: 'post', label: 'Posts', items: postItems },
  { id: 'content', label: 'On the Web', items: contentItems },
]

const tabs = computed(() => allTabs.filter(t => t.items.value.length > 0))

const defaultTab = computed(() => tabs.value[0]?.id || 'project')
const initialTab = computed(() => {
  const q = route.query.tab as string
  return tabs.value.some(t => t.id === q) ? q : defaultTab.value
})

const activeTab = ref(initialTab.value)

function setTab(id: string) {
  activeTab.value = id
  router.replace({ query: { tab: id } })
}

const filteredItems = computed(() => {
  const found = allTabs.find(t => t.id === activeTab.value)
  return found ? found.items.value : []
})
</script>
