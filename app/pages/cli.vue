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
    <NuxtLink to="/" class="normie-btn">
      Not a terminal person? Click here
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'

const input = ref('')
const lines = ref([])
const inputEl = ref(null)
const outputEl = ref(null)
const history = ref([])
const historyIndex = ref(-1)
const cwd = ref('~')

const promptStr = computed(() => `aldas@dev:${cwd.value}$ `)

// ── filesystem ──
const fs = {
  '~': {
    type: 'dir',
    children: {
      'projects': {
        type: 'dir',
        children: {
          'aldas-dev.md': {
            type: 'file',
            content: `# aldas.dev
Personal website & digital garden
Stack: Nuxt, Vue, TypeScript
Status: LIVE
URL: aldas.dev`
          },
          'project-alpha.md': {
            type: 'file',
            content: `# Project Alpha
SaaS tool for distributed teams
Stack: TypeScript, Node, Postgres
Status: In Development
Features: real-time collaboration, API-first`
          },
          'oss-lib.md': {
            type: 'file',
            content: `# Open Source Library
Developer utility library
Stack: Go, Rust
Status: Beta
Stars: 342 | Forks: 47`
          },
          'cli-tool.md': {
            type: 'file',
            content: `# CLI Tool
Productivity from the terminal
Stack: Rust
Status: WIP
Goal: replace 5 tools with 1`
          },
        }
      },
      'tweets': {
        type: 'dir',
        children: {
          '2026-03-04.txt': { type: 'file', content: 'Shipped a new feature today. Feels good.' },
          '2026-03-02.txt': { type: 'file', content: 'The best code is the code you don\'t write.' },
          '2026-02-28.txt': { type: 'file', content: 'Working on something new. More soon.' },
          '2026-02-25.txt': { type: 'file', content: 'Go is underrated for web APIs.' },
          '2026-02-20.txt': { type: 'file', content: 'Terminal > GUI. Fight me.' },
        }
      },
      'interests': {
        type: 'dir',
        children: {
          'mountaineering.txt': { type: 'file', content: 'Summits and long trails.\nLast hike: Mont Blanc circuit\nNext goal: Kilimanjaro' },
          'coffee.txt': { type: 'file', content: 'Specialty coffee enthusiast.\nMethod: Pour-over, V60\nFavorite origin: Ethiopian Yirgacheffe\nDaily cups: 3 (minimum)' },
          'keyboards.txt': { type: 'file', content: 'Mechanical keyboard builder & collector.\nCurrent daily: Custom 65%\nSwitches: Gateron Oil Kings\nKeycaps: GMK Botanical' },
          'books.txt': { type: 'file', content: 'Sci-fi reader.\nFavorites: Foundation (Asimov), Dune (Herbert), Solaris (Lem)\nCurrently reading: Blindsight by Peter Watts' },
          'chess.txt': { type: 'file', content: 'Chess player (badly).\nRating: ~1200\nFavorite opening: Sicilian Defense\nHero: Mikhail Tal' },
        }
      },
      'about.txt': {
        type: 'file',
        content: `Name:     Aldas
Role:     Developer & Builder
Location: The Internet
Status:   Shipping code, breaking less

I build things on the internet. I like clean code,
fast tools, and simple solutions to hard problems.

Links:
  github.com/aldas
  x.com/aldas`
      },
      'contact.txt': {
        type: 'file',
        content: `Email:    hello@aldas.dev
Twitter:  @aldas
GitHub:   github.com/aldas
Website:  aldas.dev`
      },
      '.secret': {
        type: 'file',
        content: `You found the hidden file. Nice.
Here's a cookie: 🍪
(Ok, one emoji is allowed for secrets)`
      },
    }
  }
}

function resolvePath(path) {
  let parts
  if (path.startsWith('~') || path.startsWith('/')) {
    parts = path.replace(/^~\/?/, '').replace(/^\//, '').split('/').filter(Boolean)
    let node = fs['~']
    for (const p of parts) {
      if (node.type !== 'dir' || !node.children[p]) return null
      node = node.children[p]
    }
    return { node, absPath: '~' + (parts.length ? '/' + parts.join('/') : '') }
  }
  // relative
  const base = cwd.value.replace(/^~\/?/, '').split('/').filter(Boolean)
  const segments = path.split('/').filter(Boolean)
  const resolved = [...base]
  for (const seg of segments) {
    if (seg === '..') resolved.pop()
    else if (seg !== '.') resolved.push(seg)
  }
  let node = fs['~']
  for (const p of resolved) {
    if (node.type !== 'dir' || !node.children[p]) return null
    node = node.children[p]
  }
  return { node, absPath: '~' + (resolved.length ? '/' + resolved.join('/') : '') }
}

function getCurrentDir() {
  return resolvePath(cwd.value)?.node || fs['~']
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
}

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
    ]
  },

  ls(args) {
    const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al')
    const pathArg = args.find(a => !a.startsWith('-'))
    const target = pathArg ? resolvePath(pathArg) : { node: getCurrentDir() }
    if (!target || target.node.type !== 'dir') {
      return [c.red(`ls: cannot access '${pathArg}': No such directory`)]
    }
    const entries = Object.keys(target.node.children)
    const filtered = showHidden ? entries : entries.filter(e => !e.startsWith('.'))
    if (filtered.length === 0) return [c.dim('(empty)')]
    return [filtered.map(name => {
      const child = target.node.children[name]
      return child.type === 'dir' ? c.blue(name + '/') : name
    }).join('    ')]
  },

  cd(args) {
    if (!args.length || args[0] === '~') {
      cwd.value = '~'
      return []
    }
    const target = resolvePath(args[0])
    if (!target || target.node.type !== 'dir') {
      return [c.red(`cd: no such directory: ${args[0]}`)]
    }
    cwd.value = target.absPath
    return []
  },

  cat(args) {
    if (!args.length) return [c.red('cat: missing file operand')]
    const target = resolvePath(args[0])
    if (!target) return [c.red(`cat: ${args[0]}: No such file`)]
    if (target.node.type === 'dir') return [c.red(`cat: ${args[0]}: Is a directory`)]
    return ['', ...target.node.content.split('\n'), '']
  },

  pwd() {
    return [cwd.value.replace('~', '/home/aldas')]
  },

  tree(args) {
    const pathArg = args[0]
    const target = pathArg ? resolvePath(pathArg) : { node: getCurrentDir(), absPath: cwd.value }
    if (!target || target.node.type !== 'dir') {
      return [c.red(`tree: '${pathArg}': No such directory`)]
    }
    const result = [c.blue(target.absPath || cwd.value)]
    function walk(node, prefix) {
      const entries = Object.keys(node.children).filter(e => !e.startsWith('.'))
      entries.forEach((name, i) => {
        const isLast = i === entries.length - 1
        const connector = isLast ? '└── ' : '├── '
        const child = node.children[name]
        const display = child.type === 'dir' ? c.blue(name + '/') : name
        result.push(prefix + connector + display)
        if (child.type === 'dir') {
          walk(child, prefix + (isLast ? '    ' : '│   '))
        }
      })
    }
    walk(target.node, '')
    return result
  },

  find(args) {
    if (!args.length) return [c.red('find: missing search pattern')]
    const pattern = args[0].toLowerCase()
    const results = []
    function walk(node, path) {
      if (node.type === 'dir') {
        for (const [name, child] of Object.entries(node.children)) {
          const fullPath = path + '/' + name
          if (name.toLowerCase().includes(pattern)) results.push(fullPath)
          walk(child, fullPath)
        }
      }
    }
    walk(fs['~'], '~')
    return results.length ? results : [c.dim('No files found matching "' + args[0] + '"')]
  },

  grep(args) {
    if (!args.length) return [c.red('grep: missing search text')]
    const pattern = args[0].toLowerCase()
    const results = []
    function walk(node, path) {
      if (node.type === 'file') {
        const matchLines = node.content.split('\n').filter(l => l.toLowerCase().includes(pattern))
        matchLines.forEach(line => {
          const highlighted = line.replace(
            new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
            (match) => c.red(match)
          )
          results.push(`${c.cyan(path)}:${highlighted}`)
        })
      }
      if (node.type === 'dir') {
        for (const [name, child] of Object.entries(node.children)) {
          walk(child, path + '/' + name)
        }
      }
    }
    walk(fs['~'], '~')
    return results.length ? results : [c.dim('No matches for "' + args[0] + '"')]
  },

  whoami() {
    return [c.green('aldas'), c.dim('developer & builder')]
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
    ]
  },

  history() {
    if (!history.value.length) return [c.dim('No commands in history')]
    return history.value.map((cmd, i) => `  ${c.dim(String(i + 1).padStart(3))}  ${cmd}`)
  },

  clear() {
    lines.value = []
    return null
  },

  exit() {
    navigateTo('/')
    return [c.dim('Switching to normal view...')]
  },

  echo(args) {
    return [args.join(' ')]
  },

  date() {
    return [new Date().toString()]
  },

  uname() {
    return ['aldas.dev 1.0.0 WASM-64 GNU/Internet']
  },
}

// ── command aliases ──
commands.ll = (args) => commands.ls(['-la', ...args])
commands.la = (args) => commands.ls(['-a', ...args])

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
]

onMounted(() => {
  lines.value = [...bootLines]
  nextTick(() => {
    inputEl.value?.focus()
    scrollToBottom()
  })
})

function focusInput() {
  inputEl.value?.focus()
}

async function scrollToBottom() {
  await nextTick()
  if (outputEl.value) {
    outputEl.value.scrollTop = outputEl.value.scrollHeight
  }
}

function handleKey(e) {
  if (e.key === 'Enter') {
    const cmd = input.value.trim()
    lines.value.push(`${c.green(promptStr.value)}${cmd}`)

    if (cmd) {
      history.value.push(cmd)
      historyIndex.value = -1
      exec(cmd)
    }

    input.value = ''
    scrollToBottom()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (history.value.length === 0) return
    if (historyIndex.value === -1) historyIndex.value = history.value.length
    historyIndex.value = Math.max(0, historyIndex.value - 1)
    input.value = history.value[historyIndex.value]
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value === -1) return
    historyIndex.value++
    if (historyIndex.value >= history.value.length) {
      historyIndex.value = -1
      input.value = ''
    } else {
      input.value = history.value[historyIndex.value]
    }
  } else if (e.key === 'Tab') {
    e.preventDefault()
    autocomplete()
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault()
    commands.clear()
  }
}

function autocomplete() {
  const parts = input.value.split(' ')
  const current = parts[parts.length - 1]
  if (!current) return

  if (parts.length === 1) {
    // command autocomplete
    const matches = Object.keys(commands).filter(c => c.startsWith(current))
    if (matches.length === 1) {
      input.value = matches[0] + ' '
    } else if (matches.length > 1) {
      lines.value.push(`${c.green(promptStr.value)}${input.value}`)
      lines.value.push(matches.join('  '))
      scrollToBottom()
    }
    return
  }

  // file/dir autocomplete
  const dir = getCurrentDir()
  if (dir.type !== 'dir') return
  const matches = Object.keys(dir.children).filter(n => n.startsWith(current))
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0]
    const node = dir.children[matches[0]]
    input.value = parts.join(' ') + (node.type === 'dir' ? '/' : '')
  } else if (matches.length > 1) {
    lines.value.push(`${c.green(promptStr.value)}${input.value}`)
    lines.value.push(matches.map(name => {
      const child = dir.children[name]
      return child.type === 'dir' ? c.blue(name + '/') : name
    }).join('  '))
    scrollToBottom()
  }
}

function exec(raw) {
  const parts = raw.split(' ').filter(Boolean)
  const cmd = parts[0]
  const args = parts.slice(1)

  if (commands[cmd]) {
    const result = commands[cmd](args)
    if (result) lines.value.push(...result)
  } else {
    lines.value.push(c.red(`command not found: ${cmd}`))
    lines.value.push(c.dim('Type "help" for available commands'))
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.terminal {
  background: hsl(var(--background));
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: hsl(var(--foreground));
  cursor: text;
}

.output {
  padding: 1.5rem;
  min-height: 100vh;
  overflow-y: auto;
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
  font-size: 0.9rem;
  flex: 1;
  caret-color: #16a34a;
  padding: 0;
  margin: 0;
}

:deep(.c-green) { color: #16a34a; }
:deep(.c-dim) { color: #a1a1aa; }
:deep(.c-bright) { color: #18181b; }
:deep(.c-blue) { color: #2563eb; }
:deep(.c-yellow) { color: #ca8a04; }
:deep(.c-red) { color: #dc2626; }
:deep(.c-cyan) { color: #0891b2; }

.normie-btn {
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 100;
  color: #a1a1aa;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  border: 1px solid #e4e4e7;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
  background: hsl(var(--background));
}

.normie-btn:hover {
  color: #18181b;
  border-color: #a1a1aa;
}
</style>
