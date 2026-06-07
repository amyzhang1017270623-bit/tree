<template>
  <Teleport to="body">
    <div v-if="visible" class="daily-limit-modal-overlay" @click.self="handleCancel">
      <div class="daily-limit-modal">
        <div class="modal-content">
          <div class="modal-icon">
            <svg class="w-16 h-16 text-amber-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <div class="modal-title">{{ title }}</div>
          <div class="modal-message">{{ message }}</div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="handleCancel">{{ cancelText }}</button>
          <button class="btn-primary" @click="handleBuy">{{ buyText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  visible: boolean
  title?: string
  message?: string
  currentUsage?: number
  dailyLimit?: number
  buyText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'buy'): void
}>()

const router = useRouter()

const handleCancel = () => {
  emit('close')
}

const handleBuy = () => {
  emit('buy')
  router.push('/payment')
}
</script>

<style scoped>
.daily-limit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.daily-limit-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-content {
  padding: 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.modal-icon {
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.modal-message {
  font-size: 14px;
  color: #b45309;
  margin-bottom: 16px;
  line-height: 1.5;
}

.modal-stats {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
}

.stat-label {
  font-size: 12px;
  color: #78350f;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #dc2626;
}

.stat-divider {
  font-size: 16px;
  color: #d97706;
}

.stat-limit {
  font-size: 16px;
  font-weight: 600;
  color: #d97706;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
}

.btn-cancel {
  flex: 1;
  padding: 12px 24px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
</style>