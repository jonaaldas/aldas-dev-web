<template>
  <div class="page">
    <nav>
      <span class="logo">~/aldas</span>
      <div class="links">
        <template v-if="about">
          <a v-for="link in about.links" :key="link.url" :href="link.url" target="_blank">{{ link.label }}</a>
        </template>
        <NuxtLink to="/cli" class="cli-link">> cli</NuxtLink>
      </div>
    </nav>

    <main>
      <section class="hero" v-if="about">
        <p class="label">Hello, I'm</p>
        <h1>{{ about.name }}</h1>
        <p class="bio">{{ about.summary }}</p>
      </section>

      <section>
        <div class="section-header">
          <span class="icon">[~]</span>
          <h2>Projects</h2>
        </div>
        <div class="project-list">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-top">
              <div class="project-name">
                <span class="bullet"></span>
                {{ project.title }}
              </div>
              <span class="project-status">{{ project.status }}</span>
            </div>
            <p class="project-desc">{{ project.description }}</p>
            <div class="project-tech">
              <code v-for="t in project.tech" :key="t">{{ t }}</code>
            </div>
            <div class="project-links" v-if="project.links">
              <a v-if="project.links.website" :href="project.links.website" target="_blank">-> visit</a>
              <a v-if="project.links.github" :href="project.links.github" target="_blank">-> github</a>
              <a v-if="project.links.video" :href="project.links.video" target="_blank">-> video</a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <span class="icon">[>]</span>
          <h2>Recent Tweets</h2>
        </div>
        <div v-if="tweetsPending" class="loading">
          <span class="loading-text">$ curl api.x.com/tweets <span class="blink">_</span></span>
        </div>
        <div v-else-if="tweetsError" class="tweet-error">
          <span class="dim">connection refused -- showing cached tweets</span>
        </div>
        <div class="tweet-list">
          <div class="tweet-card" v-for="tweet in displayTweets" :key="tweet.id">
            <div class="tweet-top">
              <span class="tweet-handle">@{{ xUsername || 'aldas' }}</span>
              <span class="tweet-date">{{ formatDate(tweet.created_at) }}</span>
            </div>
            <p class="tweet-text">{{ tweet.text }}</p>
            <a
              :href="tweet.url"
              target="_blank"
              rel="noopener"
              class="tweet-link"
              :class="{ disabled: tweet.url === '#' }"
            >
              -> view tweet
            </a>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <span class="icon">[*]</span>
          <h2>When I'm not coding</h2>
        </div>
        <div class="blog-grid">
          <NuxtLink
            v-for="post in posts"
            :key="post.path"
            :to="post.path"
            class="blog-card"
          >
            <span class="blog-icon">{{ post.icon || '>' }}</span>
            <div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.description }}</p>
            </div>
          </NuxtLink>
        </div>
      </section>
    </main>

    <footer>
      <span>&copy; {{ new Date().getFullYear() }} aldas.dev</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const xUsername = config.public.xUsername

// Fetch about info
const { data: about } = await useAsyncData('about', () =>
  queryCollection('about').first()
)

// Fetch projects (data collection, no .path)
const { data: projects } = await useAsyncData('projects', () =>
  queryCollection('projects').order('order', 'ASC').all()
)

// Fetch blog posts
const { data: posts } = await useAsyncData('posts', () =>
  queryCollection('blog').order('date', 'DESC').all()
)

// Fetch tweets
const { data: tweetsData, pending: tweetsPending, error: tweetsError } = await useFetch('/api/tweets')

const fallbackTweets = [
  { id: '1', text: 'Shipped a new feature today. Feels good.', created_at: '2026-03-04T14:32:00.000Z', url: '#' },
  { id: '2', text: 'The best code is the code you don\'t write.', created_at: '2026-03-02T09:15:00.000Z', url: '#' },
  { id: '3', text: 'Working on something new. More soon.', created_at: '2026-02-28T22:41:00.000Z', url: '#' },
  { id: '4', text: 'Go is underrated for web APIs.', created_at: '2026-02-25T11:08:00.000Z', url: '#' },
  { id: '5', text: 'Terminal > GUI. Fight me.', created_at: '2026-02-20T16:55:00.000Z', url: '#' },
]

const displayTweets = computed(() => tweetsData.value?.tweets || fallbackTweets)

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
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

.logo { font-weight: 500; }
.links { display: flex; gap: 1.5rem; align-items: center; }
.links a {
  color: #00ff4160;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}
.links a:hover { color: #00ff41; }
.cli-link {
  color: #00ff4160;
  text-decoration: none;
  font-size: 0.85rem;
  border: 1px solid #00ff4125;
  padding: 0.15rem 0.6rem;
  border-radius: 3px;
  transition: all 0.2s;
}
.cli-link:hover {
  color: #00ff41;
  border-color: #00ff41;
  background: #00ff4110;
}

main {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  padding: 3rem 0 4rem;
}

.label {
  font-size: 0.85rem;
  color: #00ff4160;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 0 30px #00ff4120;
}

.bio {
  color: #00ff4190;
  margin-top: 1rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

section {
  margin-bottom: 3.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.icon {
  color: #00ff4140;
  font-size: 0.85rem;
}

h2 {
  font-size: 1.1rem;
  font-weight: 400;
}

/* Projects */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-card {
  border: 1px solid #00ff4118;
  border-radius: 6px;
  padding: 1.25rem;
  transition: all 0.2s;
  background: rgba(0, 255, 65, 0.02);
}

.project-card:hover {
  border-color: #00ff4140;
  background: rgba(0, 255, 65, 0.05);
}

.project-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.project-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.bullet {
  width: 6px; height: 6px;
  background: #00ff41;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-status {
  font-size: 0.75rem;
  color: #00ff4150;
}

.project-desc {
  color: #00ff4170;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.project-tech {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.project-tech code {
  font-size: 0.75rem;
  color: #00ff4150;
  border: 1px solid #00ff4120;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
}

.project-links {
  display: flex;
  gap: 1rem;
}

.project-links a {
  font-size: 0.8rem;
  color: #00ff4150;
  text-decoration: none;
  transition: color 0.2s;
}

.project-links a:hover {
  color: #00ff41;
}

/* Tweets */
.loading { padding: 1rem 0; }
.loading-text { color: #00ff4160; font-size: 0.85rem; }
.blink { animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }
.tweet-error { margin-bottom: 1rem; }
.dim { color: #00ff4140; font-size: 0.8rem; }

.tweet-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tweet-card {
  border: 1px solid #00ff4118;
  border-radius: 6px;
  padding: 1.25rem;
  transition: all 0.2s;
  background: rgba(0, 255, 65, 0.02);
}

.tweet-card:hover {
  border-color: #00ff4140;
  background: rgba(0, 255, 65, 0.05);
}

.tweet-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.tweet-handle { font-size: 0.8rem; color: #00ff4180; font-weight: 500; }
.tweet-date { font-size: 0.75rem; color: #00ff4140; }

.tweet-text {
  font-size: 0.9rem;
  color: #00ff41cc;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.tweet-link {
  font-size: 0.8rem;
  color: #00ff4150;
  text-decoration: none;
  transition: color 0.2s;
}
.tweet-link:hover { color: #00ff41; }
.tweet-link.disabled { pointer-events: none; color: #00ff4125; }

/* Blog / Interests */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.blog-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #00ff4115;
  border-radius: 6px;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.blog-card:hover {
  border-color: #00ff4140;
  background: #00ff4108;
}

.blog-icon {
  font-size: 0.85rem;
  color: #00ff4150;
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
}

.blog-card h3 {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.blog-card p {
  font-size: 0.8rem;
  color: #00ff4160;
}

footer {
  text-align: center;
  padding: 3rem 2rem;
  color: #00ff4130;
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .hero h1 { font-size: 2rem; }
}
</style>
