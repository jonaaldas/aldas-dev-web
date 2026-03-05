<template>
  <div class="page">
    <nav>
      <NuxtLink to="/" class="logo">~/aldas</NuxtLink>
      <div class="links">
        <NuxtLink to="/">back</NuxtLink>
        <NuxtLink to="/cli" class="cli-link">> cli</NuxtLink>
      </div>
    </nav>

    <main v-if="post">
      <header class="detail-header">
        <NuxtLink to="/" class="breadcrumb">~/blog</NuxtLink>
        <div class="title-row">
          <span v-if="post.icon" class="post-icon">{{ post.icon }}</span>
          <h1>{{ post.title }}</h1>
        </div>
        <p class="desc">{{ post.description }}</p>
        <span class="date">{{ post.date }}</span>
      </header>

      <article class="content-body">
        <ContentRenderer :value="post" />
      </article>

      <NuxtLink to="/" class="back-link">-> back to home</NuxtLink>
    </main>

    <div v-else class="not-found">
      <p>404 -- not found</p>
      <NuxtLink to="/">-> go home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: post } = await useAsyncData(`blog-${route.path}`, () =>
  queryCollection('blog').path(route.path).first()
)

useSeoMeta({
  title: () => post.value?.title ? `${post.value.title} -- aldas.dev` : 'aldas.dev',
  description: () => post.value?.description,
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.page {
  background: #0a0a0a;
  color: #00ff41;
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.logo { font-weight: 500; color: #00ff41; text-decoration: none; }
.links { display: flex; gap: 1.5rem; align-items: center; }
.links a { color: #00ff4160; text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
.links a:hover { color: #00ff41; }
.cli-link { border: 1px solid #00ff4125; padding: 0.15rem 0.6rem; border-radius: 3px; }
.cli-link:hover { border-color: #00ff41; background: #00ff4110; }

main {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.detail-header {
  padding-bottom: 2rem;
  border-bottom: 1px solid #00ff4115;
  margin-bottom: 2rem;
}

.breadcrumb { font-size: 0.8rem; color: #00ff4140; text-decoration: none; margin-bottom: 1rem; display: block; }
.breadcrumb:hover { color: #00ff41; }

.title-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.post-icon { color: #00ff4150; font-size: 1rem; }
h1 { font-size: 2rem; font-weight: 700; }
.desc { color: #00ff4180; font-size: 0.95rem; margin-bottom: 0.5rem; }
.date { font-size: 0.8rem; color: #00ff4140; }

.content-body { line-height: 1.8; font-size: 0.95rem; }
.content-body :deep(h2) { font-size: 1.2rem; font-weight: 500; margin: 2rem 0 1rem; color: #00ff41; }
.content-body :deep(p) { color: #00ff41cc; margin-bottom: 1rem; }
.content-body :deep(ul) { padding-left: 1.5rem; margin-bottom: 1rem; }
.content-body :deep(li) { color: #00ff41cc; margin-bottom: 0.5rem; }
.content-body :deep(strong) { color: #00ff41; font-weight: 500; }
.content-body :deep(em) { color: #00ff41aa; font-style: italic; }
.content-body :deep(code) { background: #00ff4110; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.85em; }

.back-link {
  display: inline-block;
  margin-top: 3rem;
  color: #00ff4160;
  text-decoration: none;
  font-size: 0.85rem;
}
.back-link:hover { color: #00ff41; }

.not-found { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; text-align: center; }
.not-found a { color: #00ff4160; text-decoration: none; margin-top: 1rem; display: inline-block; }
.not-found a:hover { color: #00ff41; }
</style>
