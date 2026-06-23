<script setup lang="ts">
import { ref, watch } from 'vue'
import { SettingsOutline } from '@vicons/ionicons5'
import { useTimerStore } from '../stores/timerStore'

const store = useTimerStore()
const showDrawer = ref(false)

const localSettings = ref({ ...store.settings })
const todayInput = ref(store.sessionsCompleted)

watch(() => store.settings, (s) => {
  localSettings.value = { ...s }
})

function handleSave() {
  store.updateSettings(localSettings.value)
  showDrawer.value = false
}

function handleOpen() {
  localSettings.value = { ...store.settings }
  todayInput.value = store.sessionsCompleted
  showDrawer.value = true
}

function handleTodayDecrement() {
  if (todayInput.value > 0) {
    todayInput.value--
    store.setTodaySessions(todayInput.value)
  }
}

function handleTodayIncrement() {
  todayInput.value++
  store.setTodaySessions(todayInput.value)
}
</script>

<template>
  <div class="settings-trigger">
    <n-button
      circle
      size="small"
      quaternary
      @click="handleOpen"
    >
      <template #icon>
        <n-icon :component="SettingsOutline" />
      </template>
    </n-button>

    <n-drawer
      v-model:show="showDrawer"
      :width="300"
      placement="right"
    >
      <n-drawer-content title="设置" closable>
        <n-space vertical size="large" style="margin-top: 8px">
          <div>
            <div class="setting-label">专注时长（分钟）</div>
            <n-input-number
              v-model:value="localSettings.workDuration"
              :min="1"
              :max="120"
              :step="1"
              style="width: 100%"
            />
          </div>

          <div>
            <div class="setting-label">短休息时长（分钟）</div>
            <n-input-number
              v-model:value="localSettings.shortBreakDuration"
              :min="1"
              :max="60"
              :step="1"
              style="width: 100%"
            />
          </div>

          <div>
            <div class="setting-label">长休息时长（分钟）</div>
            <n-input-number
              v-model:value="localSettings.longBreakDuration"
              :min="1"
              :max="60"
              :step="1"
              style="width: 100%"
            />
          </div>

          <div>
            <div class="setting-label">长休息间隔（番茄数）</div>
            <n-input-number
              v-model:value="localSettings.longBreakInterval"
              :min="1"
              :max="10"
              :step="1"
              style="width: 100%"
            />
          </div>

          <n-divider />

          <!-- 今日番茄数调整 -->
          <div class="today-adjust">
            <span class="setting-label">今日番茄数</span>
            <div class="today-controls">
              <n-button size="small" circle @click="handleTodayDecrement" :disabled="todayInput <= 0">
                <template #icon>−</template>
              </n-button>
              <span class="today-value">{{ todayInput }}</span>
              <n-button size="small" circle @click="handleTodayIncrement">
                <template #icon>+</template>
              </n-button>
            </div>
            <div class="today-hint">误触后可在此手动修正</div>
          </div>

          <n-divider />

          <n-space justify="space-between" align="center">
            <span class="setting-label">提示音</span>
            <n-switch v-model:value="localSettings.soundEnabled" />
          </n-space>

          <n-space justify="space-between" align="center">
            <span class="setting-label">窗口置顶</span>
            <n-switch v-model:value="localSettings.alwaysOnTop" @update:value="store.toggleAlwaysOnTop()" />
          </n-space>
        </n-space>

        <template #footer>
          <n-button type="primary" block @click="handleSave">
            保存设置
          </n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.settings-trigger {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.setting-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.today-adjust {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.today-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.today-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.today-hint {
  font-size: 11px;
  color: var(--text-tertiary);
}
</style>
