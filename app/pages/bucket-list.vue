<template>
  <div class="min-h-screen bg-background text-foreground">
    <main class="mx-auto max-w-3xl px-6 py-4">
      <div class="mb-4 flex gap-2">
        <Button variant="ghost" size="sm" class="h-7 rounded-full px-3 text-xs text-muted-foreground">
          {{ bucketList?.length || 0 }} items
        </Button>
      </div>

      <Card class="overflow-hidden">
        <CardContent class="p-0">
          <div class="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto] gap-4 border-b border-border px-4 py-3 md:grid">
            <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Item</p>
            <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Progress</p>
            <p class="text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-right">Status</p>
          </div>

          <div
            v-for="item in bucketList"
            :key="`${item.want}-${item.order ?? 0}`"
            class="grid gap-4 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto]"
          >
            <div>
              <p class="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:hidden">Item</p>
              <p class="text-sm leading-relaxed text-foreground">
                {{ item.want }}
              </p>
            </div>

            <div>
              <p class="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:hidden">Progress</p>
              <p class="text-sm leading-relaxed text-muted-foreground">
                {{ item.progress }}
              </p>
            </div>

            <div class="flex items-start md:justify-end">
              <div>
                <p class="mb-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:hidden">Status</p>
                <Badge :class="statusClass(item.status)" class="shrink-0 text-[10px] font-medium">
                  {{ item.status }}
                </Badge>
              </div>
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSiteData } from '@/composables/useSiteData';

useSeoMeta({
  title: 'Bucket List | aldas.dev',
  description: 'A simple list of things I want to do and how they are progressing.',
});

const { bucketList } = useSiteData();

function statusClass(status: string) {
  switch (status) {
    case 'Done':
      return 'bg-emerald-100 text-emerald-700';
    case 'In Progress':
      return 'bg-amber-100 text-amber-700';
    case 'Planned':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}
</script>
