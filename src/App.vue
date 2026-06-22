<script setup>
  import { computed, ref, watch } from 'vue'

  /* =======================
   To Do List
======================= */

  const todoText = ref('')

  // 安全讀取 localStorage（避免 JSON 壞掉卡死）
  let savedTodos = []

  try {
    const raw = localStorage.getItem('todos')
    savedTodos = raw ? JSON.parse(raw) : []
  } catch {
    savedTodos = []
  }

  const todos = ref(savedTodos)

  function addTodo () {
    if (!todoText.value.trim()) return

    todos.value.push({
      text: todoText.value,
      done: false,
    })

    todoText.value = ''
  }

  function deleteTodo (index) {
    todos.value.splice(index, 1)
  }

  /* 自動存入 localStorage（不會卡死版本） */
  watch(
    todos,
    val => {
      localStorage.setItem('todos', JSON.stringify(val))
    },
    { deep: true },
  )

  /* =======================
   Pomodoro Timer
======================= */

  const isBreak = ref(false)

  const timer = ref(25 * 60)

  let interval = null

  const formatTime = computed(() => {
    const min = Math.floor(timer.value / 60)
    const sec = timer.value % 60
    return `${min}:${String(sec).padStart(2, '0')}`
  })

  function startTimer () {
    if (interval) return

    interval = setInterval(() => {
      timer.value--

      if (timer.value <= 0) {
        clearInterval(interval)
        interval = null

        isBreak.value = !isBreak.value

        timer.value = isBreak.value ? 5 * 60 : 25 * 60

        // 🔔 音效（可自行放 public/bell.mp3）
        const audio = new Audio('/bell.mp3')
        audio.play()

        startTimer()
      }
    }, 1000)
  }

  function pauseTimer () {
    clearInterval(interval)
    interval = null
  }

  function skipTimer () {
    clearInterval(interval)
    interval = null

    isBreak.value = !isBreak.value
    timer.value = isBreak.value ? 5 * 60 : 25 * 60
  }
</script>

<template>
  <v-app>
    <v-main>
      <v-container>

        <!-- =======================
             番茄鐘
        ======================== -->
        <h1>🍅 番茄鐘</h1>

        <h2>
          {{ isBreak ? '休息時間 😌' : '專注時間 💪' }}
        </h2>

        <h1 style="font-size: 48px;">
          {{ formatTime }}
        </h1>

        <v-btn color="green" @click="startTimer">開始</v-btn>
        <v-btn color="orange" @click="pauseTimer">暫停</v-btn>
        <v-btn color="blue" @click="skipTimer">跳過</v-btn>

        <v-divider class="my-6" />

        <!-- =======================
             To Do List
        ======================== -->

        <h2>📌 待辦事項</h2>

        <v-text-field
          v-model="todoText"
          label="輸入事項"
        />

        <v-btn color="primary" @click="addTodo">
          新增
        </v-btn>

        <v-list class="mt-4">

          <v-list-item
            v-for="(todo, index) in todos"
            :key="index"
          >

            <template #prepend>
              <v-checkbox v-model="todo.done" />
            </template>

            <v-list-item-title
              :style="{
                textDecoration: todo.done ? 'line-through' : 'none'
              }"
            >
              {{ todo.text }}
            </v-list-item-title>

            <template #append>
              <v-btn
                color="red"
                icon="mdi-delete"
                @click="deleteTodo(index)"
              />
            </template>

          </v-list-item>

        </v-list>

      </v-container>
    </v-main>
  </v-app>
</template>
