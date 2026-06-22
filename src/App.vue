let timer: number | null = null<template>
  <div class="app">
    <h1>🍅 我的番茄鐘 💖</h1>

    <h2>{{ modeText }}</h2>
    <h1>{{ displayTime }}</h1>

    <div class="buttons">
      <button @click="setMode('work')">工作 25分</button>
      <button @click="setMode('break')">休息 5分</button>
    </div>

    <div class="buttons">
      <button @click="startTimer">開始</button>
      <button @click="pauseTimer">暫停</button>
      <button @click="resetTimer">重置</button>
      <button @click="skipTimer">跳過</button>
    </div>

    <hr>

    <h3>🔊 鈴聲</h3>

    <select v-model="selectedSound">
      <option value="beep">嗶嗶聲</option>
      <option value="bell">鈴鐺聲</option>
      <option value="soft">柔和</option>
    </select>

    <hr>

    <h3>📝 待辦清單</h3>

    <input
      v-model="newTodo"
      placeholder="輸入待辦事項"
      @keyup.enter="addTodo"
    >

    <button @click="addTodo">新增</button>

    <ul>
      <li v-for="(todo, index) in todos" :key="index">
        <input v-model="todo.done" type="checkbox">

        <span :class="{ done: todo.done }">
          {{ todo.text }}
        </span>

        <button @click="removeTodo(index)">刪除</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  /* ===== 時間設定（安全型別） ===== */
  const workSeconds = 25 * 60
  const breakSeconds = 5 * 60

  const mode = ref<'work' | 'break'>('work')
  const time = ref<number>(workSeconds)

  /* ===== 計時器（重點修正） ===== */
  let timer: ReturnType<typeof setInterval> | null = null

  /* ===== 鈴聲 ===== */
  const selectedSound = ref(localStorage.getItem('sound') || 'beep')

  watch(selectedSound, val => {
    localStorage.setItem('sound', val)
  })

  function playSound () {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value
      = selectedSound.value === 'bell'
        ? 1200
        : (selectedSound.value === 'soft'
          ? 500
          : 800)

    gain.gain.value = 0.2

    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  }

  /* ===== Todo（localStorage 安全版） ===== */
  type Todo = { text: string, done: boolean }

  const saved = localStorage.getItem('todos')

  const todos = ref<Todo[]>(
    saved ? JSON.parse(saved) : [],
  )

  watch(todos, val => {
    localStorage.setItem('todos', JSON.stringify(val))
  }, { deep: true })

  const newTodo = ref('')

  /* ===== UI ===== */
  const modeText = computed(() =>
    mode.value === 'work' ? '📚 工作時間' : '☕ 休息時間',
  )

  const displayTime = computed(() => {
    const m = Math.floor(time.value / 60)
    const s = time.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  /* ===== 核心功能 ===== */
  function setMode (m: 'work' | 'break') {
    mode.value = m
    resetTimer()
  }

  function startTimer () {
    if (timer) return

    timer = setInterval(() => {
      time.value--

      if (time.value <= 0) {
        clearInterval(timer!)
        timer = null

        playSound()
        alert('時間到！')

        mode.value = mode.value === 'work' ? 'break' : 'work'
        resetTimer()
        startTimer()
      }
    }, 1000)
  }

  function pauseTimer () {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function resetTimer () {
    pauseTimer()

    time.value
      = mode.value === 'work'
        ? workSeconds
        : breakSeconds
  }

  function skipTimer () {
    pauseTimer()

    mode.value = mode.value === 'work' ? 'break' : 'work'
    resetTimer()
  }

  /* ===== Todo ===== */
  function addTodo () {
    if (!newTodo.value.trim()) return

    todos.value.push({
      text: newTodo.value,
      done: false,
    })

    newTodo.value = ''
  }

  function removeTodo (index: number) {
    todos.value.splice(index, 1)
  }
</script>

<style scoped>
.app {
  max-width: 700px;
  margin: 30px auto;
  padding: 30px;
  text-align: center;
  font-family: "Microsoft JhengHei", sans-serif;
  background: #fff5f8;
  border-radius: 25px;
  box-shadow: 0 8px 20px rgba(255, 182, 193, 0.35);
}

h1 {
  color: #ff69b4;
}

h2 {
  color: #ff85c1;
}

.buttons {
  margin: 15px 0;
}

button {
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  margin: 5px;
  background: #ffb6c1;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  transform: scale(1.05);
  background: #ff8fb1;
}

input, select {
  padding: 10px;
  border-radius: 12px;
  border: 2px solid #ffc0cb;
  margin: 5px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: white;
  margin: 10px auto;
  padding: 10px;
  max-width: 450px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.25);
}

.done {
  text-decoration: line-through;
  opacity: 0.5;
}

hr {
  border: none;
  border-top: 2px dashed #ffc0cb;
  margin: 25px 0;
}
</style>
