<template>
  <div>
    <NuxtRouteAnnouncer />
    <SiteHeader
      v-if="headerConfig"
      :about="about"
      :title="headerConfig.title"
      :subtitle="headerConfig.subtitle"
      :description="headerConfig.description"
      :title-to="headerConfig.titleTo"
      :actions="headerConfig.actions"
      :mobile-actions="headerConfig.mobileActions"
    />
    <Separator v-if="headerConfig" class="mx-auto max-w-3xl" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SiteHeader from '@/components/SiteHeader.vue';
import { Separator } from '@/components/ui/separator';
import { useSiteData } from '@/composables/useSiteData';

const route = useRoute();
const { about } = useSiteData();

const headerConfig = computed(() => {
  if (route.path === '/') {
    return {
      title: about.name,
      subtitle: about.role,
      description: about.summary,
      titleTo: undefined,
      actions: [
        { label: 'bucket list', to: '/bucket-list', variant: 'ghost' as const },
        { label: 'cli', to: '/cli', variant: 'outline' as const, prefix: '>_', prefixClass: 'text-green-600' },
      ],
      mobileActions: [
        { label: 'terminal mode', to: '/cli', prefix: '>_', prefixClass: 'text-green-600' },
        { label: 'bucket list', to: '/bucket-list', prefix: '#' },
      ],
    };
  }

  if (route.path === '/bucket-list') {
    return {
      title: about.name,
      subtitle: 'Bucket list, in public.',
      description:
        'A living list of things I want to do, build, and experience. Same site, same language, just a more personal tab.',
      titleTo: '/',
      actions: [
        { label: 'home', to: '/', variant: 'ghost' as const },
        { label: 'cli', to: '/cli', variant: 'outline' as const, prefix: '>_', prefixClass: 'text-green-600' },
      ],
      mobileActions: [
        { label: 'home', to: '/', prefix: '~/' },
        { label: 'terminal mode', to: '/cli', prefix: '>_', prefixClass: 'text-green-600' },
      ],
    };
  }

  if (route.path === '/cli') {
    return {
      title: about.name,
      subtitle: 'Terminal mode.',
      description: about.summary,
      titleTo: '/',
      actions: [{ label: 'home', to: '/', variant: 'ghost' as const }],
      mobileActions: [{ label: 'home', to: '/', prefix: '~/' }],
    };
  }

  return null;
});
</script>
