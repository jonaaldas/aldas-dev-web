<template>
  <div class="terminal" @click="focusInput">
    <div class="output" ref="outputEl">
      <div v-for="(line, i) in lines" :key="i" v-html="line" class="line"></div>
      <div class="input-line">
        <span class="prompt-text">{{ promptStr }}</span>
        <input
          ref="inputEl"
          v-model="input"
          @keydown="handleKey"
          class="cmd-input"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>
    </div>
    <NuxtLink to="/" class="normie-btn"> ← back to web </NuxtLink>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue';

const { data: about } = await useAsyncData('cli-about', () => queryCollection('about').first());
const { data: projects } = await useAsyncData('cli-projects', () =>
  queryCollection('projects').order('order', 'ASC').all()
);
const { data: posts } = await useAsyncData('cli-posts', () => queryCollection('blog').order('date', 'DESC').all());
const { data: socialContent } = await useAsyncData('cli-content', () =>
  queryCollection('content').order('order', 'ASC').all()
);
const { data: bucketList } = await useAsyncData('cli-bucket-list', () =>
  queryCollection('bucketList').order('order', 'ASC').all()
);

const input = ref('');
const lines = ref([]);
const inputEl = ref(null);
const outputEl = ref(null);
const history = ref([]);
const historyIndex = ref(-1);
const cwd = ref('~');

const promptStr = computed(() => `aldas@dev:${cwd.value}$ `);

// ── filesystem ──
function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createFile(content) {
  return { type: 'file', content };
}

const projectFiles = Object.fromEntries(
  (projects.value || []).map((project) => [
    `${toSlug(project.title)}.md`,
    createFile(
      `# ${project.title}
${project.description}
Date: ${project.date}
Status: ${project.status}
Tech: ${project.tech.join(', ')}

${project.paragraphs.join('\n\n')}

Links:
${project.links.website ? `  website: ${project.links.website}\n` : ''}${project.links.github ? `  github: ${project.links.github}\n` : ''}${project.links.video ? `  video: ${project.links.video}` : ''}`.trim()
    ),
  ])
);

const postFiles = Object.fromEntries(
  (posts.value || []).map((post) => [
    `${toSlug(post.title)}.md`,
    createFile(
      `# ${post.title}
${post.description}
Date: ${post.date}
Route: ${post.path}
${post.icon ? `Icon: ${post.icon}\n` : ''}Read on site: https://aldas.dev${post.path}`.trim()
    ),
  ])
);

const contentFiles = Object.fromEntries(
  (socialContent.value || []).map((item) => [
    `${toSlug(item.title)}.txt`,
    createFile(`Title: ${item.title}
Source: ${item.source}
Date: ${item.date}
URL: ${item.url}${item.thumbnail ? `\nThumbnail: ${item.thumbnail}` : ''}`),
  ])
);

const bucketListFiles = Object.fromEntries(
  (bucketList.value || []).map((item) => {
    return [
      `${toSlug(item.title)}.md`,
      createFile(`# ${item.title}
Status: ${item.status}

What I want:
${item.want}

How it's going:
${item.progress}`),
    ];
  })
);

const aboutFile = createFile(`Name:     ${about.value?.name || ''}
Role:     ${about.value?.role || ''}
Location: ${about.value?.location || ''}

${about.value?.summary || ''}`);

const contactFile = createFile(`Links:
${(about.value?.links || []).map((link) => `  ${link.label}: ${link.url}`).join('\n')}
Website:  https://aldas.dev`);

const fs = {
  '~': {
    type: 'dir',
    children: {
      projects: {
        type: 'dir',
        children: projectFiles,
      },
      'on-the-web': {
        type: 'dir',
        children: contentFiles,
      },
      interests: {
        type: 'dir',
        children: postFiles,
      },
      'bucket-list': {
        type: 'dir',
        children: bucketListFiles,
      },
      'about.txt': aboutFile,
      'contact.txt': contactFile,
      '.secret': {
        type: 'file',
        content: `You found the hidden file. Nice.
Here's a cookie: 🍪
(Ok, one emoji is allowed for secrets)`,
      },
    },
  },
};

function resolvePath(path) {
  let parts;
  if (path.startsWith('~') || path.startsWith('/')) {
    parts = path.replace(/^~\/?/, '').replace(/^\//, '').split('/').filter(Boolean);
    let node = fs['~'];
    for (const p of parts) {
      if (node.type !== 'dir' || !node.children[p]) return null;
      node = node.children[p];
    }
    return { node, absPath: '~' + (parts.length ? '/' + parts.join('/') : '') };
  }
  // relative
  const base = cwd.value.replace(/^~\/?/, '').split('/').filter(Boolean);
  const segments = path.split('/').filter(Boolean);
  const resolved = [...base];
  for (const seg of segments) {
    if (seg === '..') resolved.pop();
    else if (seg !== '.') resolved.push(seg);
  }
  let node = fs['~'];
  for (const p of resolved) {
    if (node.type !== 'dir' || !node.children[p]) return null;
    node = node.children[p];
  }
  return { node, absPath: '~' + (resolved.length ? '/' + resolved.join('/') : '') };
}

function getCurrentDir() {
  return resolvePath(cwd.value)?.node || fs['~'];
}

// ── colors ──
const c = {
  green: (s) => `<span class="c-green">${s}</span>`,
  dim: (s) => `<span class="c-dim">${s}</span>`,
  bright: (s) => `<span class="c-bright">${s}</span>`,
  blue: (s) => `<span class="c-blue">${s}</span>`,
  yellow: (s) => `<span class="c-yellow">${s}</span>`,
  red: (s) => `<span class="c-red">${s}</span>`,
  cyan: (s) => `<span class="c-cyan">${s}</span>`,
};

// ── commands ──
const commands = {
  help() {
    return [
      '',
      c.bright('Available commands:'),
      '',
      `  ${c.green('ls')} ${c.dim('[path]')}          List directory contents`,
      `  ${c.green('cd')} ${c.dim('<path>')}          Change directory`,
      `  ${c.green('cat')} ${c.dim('<file>')}         Read a file`,
      `  ${c.green('pwd')}                Print working directory`,
      `  ${c.green('tree')} ${c.dim('[path]')}        Show directory tree`,
      `  ${c.green('find')} ${c.dim('<pattern>')}     Search for files`,
      `  ${c.green('grep')} ${c.dim('<text>')}        Search file contents`,
      `  ${c.green('whoami')}             Who are you?`,
      `  ${c.green('neofetch')}           System info`,
      `  ${c.green('history')}            Command history`,
      `  ${c.green('clear')}              Clear terminal`,
      `  ${c.green('exit')}               Go to normal site`,
      '',
      c.dim('Tip: try "ls -a" to see hidden files'),
      '',
    ];
  },

  ls(args) {
    const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const pathArg = args.find((a) => !a.startsWith('-'));
    const target = pathArg ? resolvePath(pathArg) : { node: getCurrentDir() };
    if (!target || target.node.type !== 'dir') {
      return [c.red(`ls: cannot access '${pathArg}': No such directory`)];
    }
    const entries = Object.keys(target.node.children);
    const filtered = showHidden ? entries : entries.filter((e) => !e.startsWith('.'));
    if (filtered.length === 0) return [c.dim('(empty)')];
    return [
      filtered
        .map((name) => {
          const child = target.node.children[name];
          return child.type === 'dir' ? c.blue(name + '/') : name;
        })
        .join('    '),
    ];
  },

  cd(args) {
    if (!args.length || args[0] === '~') {
      cwd.value = '~';
      return [];
    }
    const target = resolvePath(args[0]);
    if (!target || target.node.type !== 'dir') {
      return [c.red(`cd: no such directory: ${args[0]}`)];
    }
    cwd.value = target.absPath;
    return [];
  },

  cat(args) {
    if (!args.length) return [c.red('cat: missing file operand')];
    const target = resolvePath(args[0]);
    if (!target) return [c.red(`cat: ${args[0]}: No such file`)];
    if (target.node.type === 'dir') return [c.red(`cat: ${args[0]}: Is a directory`)];
    return ['', ...target.node.content.split('\n'), ''];
  },

  pwd() {
    return [cwd.value.replace('~', '/home/aldas')];
  },

  tree(args) {
    const pathArg = args[0];
    const target = pathArg ? resolvePath(pathArg) : { node: getCurrentDir(), absPath: cwd.value };
    if (!target || target.node.type !== 'dir') {
      return [c.red(`tree: '${pathArg}': No such directory`)];
    }
    const result = [c.blue(target.absPath || cwd.value)];
    function walk(node, prefix) {
      const entries = Object.keys(node.children).filter((e) => !e.startsWith('.'));
      entries.forEach((name, i) => {
        const isLast = i === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const child = node.children[name];
        const display = child.type === 'dir' ? c.blue(name + '/') : name;
        result.push(prefix + connector + display);
        if (child.type === 'dir') {
          walk(child, prefix + (isLast ? '    ' : '│   '));
        }
      });
    }
    walk(target.node, '');
    return result;
  },

  find(args) {
    if (!args.length) return [c.red('find: missing search pattern')];
    const pattern = args[0].toLowerCase();
    const results = [];
    function walk(node, path) {
      if (node.type === 'dir') {
        for (const [name, child] of Object.entries(node.children)) {
          const fullPath = path + '/' + name;
          if (name.toLowerCase().includes(pattern)) results.push(fullPath);
          walk(child, fullPath);
        }
      }
    }
    walk(fs['~'], '~');
    return results.length ? results : [c.dim('No files found matching "' + args[0] + '"')];
  },

  grep(args) {
    if (!args.length) return [c.red('grep: missing search text')];
    const pattern = args[0].toLowerCase();
    const results = [];
    function walk(node, path) {
      if (node.type === 'file') {
        const matchLines = node.content.split('\n').filter((l) => l.toLowerCase().includes(pattern));
        matchLines.forEach((line) => {
          const highlighted = line.replace(
            new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
            (match) => c.red(match)
          );
          results.push(`${c.cyan(path)}:${highlighted}`);
        });
      }
      if (node.type === 'dir') {
        for (const [name, child] of Object.entries(node.children)) {
          walk(child, path + '/' + name);
        }
      }
    }
    walk(fs['~'], '~');
    return results.length ? results : [c.dim('No matches for "' + args[0] + '"')];
  },

  whoami() {
    return [c.green('aldas'), c.dim('developer & builder')];
  },

  neofetch() {
    return [
      '',
      `${c.green('       ___       ')}  ${c.bright('aldas@dev')}`,
      `${c.green('      /   \\      ')}  ${c.dim('----------')}`,
      `${c.green('     /     \\     ')}  ${c.green('OS:')} aldas.dev 1.0`,
      `${c.green('    / aldas \\    ')}  ${c.green('Shell:')} zsh 5.9`,
      `${c.green('   /    .    \\   ')}  ${c.green('Terminal:')} this one`,
      `${c.green('  /    dev    \\  ')}  ${c.green('Editor:')} neovim`,
      `${c.green(' /      _      \\ ')}  ${c.green('Stack:')} Vue, Nuxt, Go, Rust`,
      `${c.green(' \\             / ')}  ${c.green('Coffee:')} 3 cups/day`,
      `${c.green('  \\           /  ')}  ${c.green('Uptime:')} since '96`,
      `${c.green('   \\_________/   ')}  ${c.green('Status:')} shipping`,
      '',
    ];
  },

  history() {
    if (!history.value.length) return [c.dim('No commands in history')];
    return history.value.map((cmd, i) => `  ${c.dim(String(i + 1).padStart(3))}  ${cmd}`);
  },

  clear() {
    lines.value = [];
    return null;
  },

  exit() {
    navigateTo('/');
    return [c.dim('Switching to normal view...')];
  },

  echo(args) {
    return [args.join(' ')];
  },

  date() {
    return [new Date().toString()];
  },

  uname() {
    return ['aldas.dev 1.0.0 WASM-64 GNU/Internet'];
  },
};

// ── command aliases ──
commands.ll = (args) => commands.ls(['-la', ...args]);
commands.la = (args) => commands.ls(['-a', ...args]);

// ── boot ──
const bootLines = [
  c.dim('BIOS v1.0 ... OK'),
  c.dim('Loading kernel ... OK'),
  c.dim('Mounting filesystem ... OK'),
  c.dim('Starting network ... OK'),
  '',
  c.bright('Welcome to aldas.dev'),
  c.dim('Type "help" for available commands.'),
  c.dim('Try "ls" to look around or "neofetch" for system info.'),
  '',
];

onMounted(() => {
  lines.value = [...bootLines];
  nextTick(() => {
    inputEl.value?.focus();
    scrollToBottom();
  });
});

function focusInput() {
  inputEl.value?.focus();
}

async function scrollToBottom() {
  await nextTick();
  if (outputEl.value) {
    outputEl.value.scrollTop = outputEl.value.scrollHeight;
  }
}

function handleKey(e) {
  if (e.key === 'Enter') {
    const cmd = input.value.trim();
    lines.value.push(`${c.green(promptStr.value)}${cmd}`);

    if (cmd) {
      history.value.push(cmd);
      historyIndex.value = -1;
      exec(cmd);
    }

    input.value = '';
    scrollToBottom();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (history.value.length === 0) return;
    if (historyIndex.value === -1) historyIndex.value = history.value.length;
    historyIndex.value = Math.max(0, historyIndex.value - 1);
    input.value = history.value[historyIndex.value];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex.value === -1) return;
    historyIndex.value++;
    if (historyIndex.value >= history.value.length) {
      historyIndex.value = -1;
      input.value = '';
    } else {
      input.value = history.value[historyIndex.value];
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    autocomplete();
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    commands.clear();
  }
}

function autocomplete() {
  const parts = input.value.split(' ');
  const current = parts[parts.length - 1];
  if (!current) return;

  if (parts.length === 1) {
    // command autocomplete
    const matches = Object.keys(commands).filter((c) => c.startsWith(current));
    if (matches.length === 1) {
      input.value = matches[0] + ' ';
    } else if (matches.length > 1) {
      lines.value.push(`${c.green(promptStr.value)}${input.value}`);
      lines.value.push(matches.join('  '));
      scrollToBottom();
    }
    return;
  }

  // file/dir autocomplete
  const dir = getCurrentDir();
  if (dir.type !== 'dir') return;
  const matches = Object.keys(dir.children).filter((n) => n.startsWith(current));
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0];
    const node = dir.children[matches[0]];
    input.value = parts.join(' ') + (node.type === 'dir' ? '/' : '');
  } else if (matches.length > 1) {
    lines.value.push(`${c.green(promptStr.value)}${input.value}`);
    lines.value.push(
      matches
        .map((name) => {
          const child = dir.children[name];
          return child.type === 'dir' ? c.blue(name + '/') : name;
        })
        .join('  ')
    );
    scrollToBottom();
  }
}

function exec(raw) {
  const parts = raw.split(' ').filter(Boolean);
  const cmd = parts[0];
  const args = parts.slice(1);

  if (commands[cmd]) {
    const result = commands[cmd](args);
    if (result) lines.value.push(...result);
  } else {
    lines.value.push(c.red(`command not found: ${cmd}`));
    lines.value.push(c.dim('Type "help" for available commands'));
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.terminal {
  background: hsl(var(--background));
  min-height: 100vh;
  min-height: 100dvh;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: hsl(var(--foreground));
  cursor: text;
  overflow-x: hidden;
}

@media (min-width: 640px) {
  .terminal {
    font-size: 0.9rem;
  }
}

.output {
  padding: 1rem;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (min-width: 640px) {
  .output {
    padding: 1.5rem;
  }
}

.line {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.input-line {
  display: flex;
  align-items: center;
  line-height: 1.6;
}

.prompt-text {
  color: #16a34a;
  white-space: nowrap;
  flex-shrink: 0;
}

.cmd-input {
  background: transparent;
  border: none;
  outline: none;
  color: hsl(var(--foreground));
  font-family: 'JetBrains Mono', monospace;
  font-size: inherit;
  flex: 1;
  min-width: 0;
  caret-color: #16a34a;
  padding: 0;
  margin: 0;
}

:deep(.c-green) {
  color: #16a34a;
}
:deep(.c-dim) {
  color: #a1a1aa;
}
:deep(.c-bright) {
  color: #18181b;
}
:deep(.c-blue) {
  color: #2563eb;
}
:deep(.c-yellow) {
  color: #ca8a04;
}
:deep(.c-red) {
  color: #dc2626;
}
:deep(.c-cyan) {
  color: #0891b2;
}

.normie-btn {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 100;
  color: #a1a1aa;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  border: 1px solid #e4e4e7;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
  background: hsl(var(--background));
}

@media (min-width: 640px) {
  .normie-btn {
    top: 1.25rem;
    right: 1.5rem;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
}

.normie-btn:hover {
  color: #18181b;
  border-color: #a1a1aa;
}
</style>
