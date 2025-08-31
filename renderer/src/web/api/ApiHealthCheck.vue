<template>
  <div class="api-status p-2 text-xs">
    <div class="flex items-center gap-2">
      <div 
        :class="{
          'bg-green-500': isConnected,
          'bg-red-500': !isConnected && !isLoading,
          'bg-yellow-500': isLoading
        }"
        class="w-2 h-2 rounded-full"
      ></div>
      <span class="text-gray-400">
        {{ statusText }}
      </span>
      <button 
        v-if="!isConnected && !isLoading"
        @click="checkConnection"
        class="text-blue-400 hover:text-blue-300 underline ml-2"
      >
        Retry
      </button>
    </div>
    <div v-if="error" class="text-red-400 text-xs mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { restApiClient } from "@/web/api/RestApiClient";

export default defineComponent({
  name: "ApiHealthCheck",
  setup() {
    const isLoading = ref(false);
    const isConnected = ref(false);
    const error = ref<string | null>(null);

    const statusText = computed(() => {
      if (isLoading.value) return "Checking API...";
      if (isConnected.value) return "API Connected";
      return "API Disconnected";
    });

    async function checkConnection() {
      isLoading.value = true;
      error.value = null;

      try {
        const result = await restApiClient.getHealth();
        if (result.isOk()) {
          isConnected.value = true;
        } else {
          isConnected.value = false;
          error.value = result.error;
        }
      } catch (err) {
        isConnected.value = false;
        error.value = "Failed to connect to http://localhost:3000";
      } finally {
        isLoading.value = false;
      }
    }

    onMounted(() => {
      checkConnection();
    });

    return {
      isLoading,
      isConnected,
      error,
      statusText,
      checkConnection,
    };
  },
});
</script>
</template>