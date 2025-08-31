<template>
  <div v-if="show" class="p-4 layout-column min-h-0">
    <!-- API Status Indicator -->
    <div class="mb-2 text-xs text-gray-500">
      <div class="flex items-center gap-2">
        <div 
          :class="{
            'bg-green-500': apiConnected,
            'bg-red-500': !apiConnected,
          }"
          class="w-2 h-2 rounded-full"
        ></div>
        <span>
          {{ apiConnected ? 'REST API Connected' : 'REST API Disconnected' }}
        </span>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center p-8">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
        <div class="text-gray-400">{{ t("Analyzing item...") }}</div>
      </div>
    </div>
    
    <div v-else-if="apiError" class="p-4">
      <div class="bg-red-800 border border-red-600 rounded p-3">
        <div class="text-red-200 font-semibold">{{ t("Price Check Error") }}</div>
        <div class="text-red-300 text-sm mt-1">{{ apiError }}</div>
        <button 
          @click="retryPriceCheck" 
          class="btn mt-2 text-sm"
        >
          {{ t("Retry") }}
        </button>
      </div>
    </div>

    <template v-else-if="priceData">
      <!-- Item Name and Basic Info -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-200">
          {{ priceData.itemName || item.info.name }}
        </h3>
        <div class="text-sm text-gray-400">
          {{ priceData.baseType || item.info.refName }}
          <span v-if="priceData.category" class="ml-2">
            ({{ priceData.category }})
          </span>
        </div>
      </div>

      <!-- Price Statistics -->
      <div v-if="priceData.priceStats && priceData.priceStats.totalListings > 0" class="mb-4 bg-gray-700 rounded p-3">
        <div class="text-gray-300 font-medium mb-2">{{ t("Price Analysis") }}</div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-400">{{ t("Median Price") }}</div>
            <div class="text-yellow-400 font-semibold">
              {{ priceData.priceStats.median || "N/A" }} {{ priceData.priceStats.currency }}
            </div>
          </div>
          <div>
            <div class="text-gray-400">{{ t("Average Price") }}</div>
            <div class="text-blue-400 font-semibold">
              {{ priceData.priceStats.average || "N/A" }} {{ priceData.priceStats.currency }}
            </div>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          {{ t("Based on") }} {{ priceData.priceStats.totalListings }} {{ t("listings") }}
        </div>
      </div>

      <!-- Price Recommendations (from analyze endpoint) -->
      <div v-if="recommendations" class="mb-4 bg-gray-700 rounded p-3">
        <div class="text-gray-300 font-medium mb-2">{{ t("Price Recommendations") }}</div>
        <div class="grid grid-cols-3 gap-2 text-sm">
          <div class="text-center">
            <div class="text-green-400 font-semibold">
              {{ recommendations.quickSell || "N/A" }}
            </div>
            <div class="text-xs text-gray-400">{{ t("Quick Sell") }}</div>
          </div>
          <div class="text-center">
            <div class="text-yellow-400 font-semibold">
              {{ recommendations.fairPrice || "N/A" }}
            </div>
            <div class="text-xs text-gray-400">{{ t("Fair Price") }}</div>
          </div>
          <div class="text-center">
            <div class="text-red-400 font-semibold">
              {{ recommendations.highPrice || "N/A" }}
            </div>
            <div class="text-xs text-gray-400">{{ t("High Price") }}</div>
          </div>
        </div>
        <div class="mt-1 text-xs text-gray-500 text-center">
          {{ t("Currency") }}: {{ recommendations.currency }}
        </div>
      </div>

      <!-- Recent Listings -->
      <div v-if="priceData.listings && priceData.listings.length > 0" class="mb-4">
        <div class="text-gray-300 font-medium mb-2">
          {{ t("Recent Listings") }} ({{ priceData.listings.length }})
        </div>
        <div class="bg-gray-800 rounded overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-900">
              <tr>
                <th class="px-3 py-2 text-left">{{ t("Price") }}</th>
                <th class="px-3 py-2 text-left">{{ t("Seller") }}</th>
                <th class="px-3 py-2 text-left">{{ t("Listed") }}</th>
                <th class="px-3 py-2 text-left">{{ t("Status") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(listing, index) in priceData.listings.slice(0, 10)" 
                :key="listing.id"
                :class="{ 'bg-gray-750': index % 2 === 1 }"
                class="border-b border-gray-700"
              >
                <td class="px-3 py-2">
                  <span class="font-semibold">
                    {{ listing.priceAmount }} {{ listing.priceCurrency }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  <div class="text-blue-400">{{ listing.accountName }}</div>
                  <div class="text-xs text-gray-500">{{ listing.characterName }}</div>
                </td>
                <td class="px-3 py-2 text-gray-400">
                  {{ listing.relativeDate }}
                </td>
                <td class="px-3 py-2">
                  <span 
                    :class="{
                      'text-green-400': listing.accountStatus === 'online',
                      'text-yellow-400': listing.accountStatus === 'afk',
                      'text-red-400': listing.accountStatus === 'offline'
                    }"
                    class="text-xs font-medium"
                  >
                    {{ listing.accountStatus.toUpperCase() }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Listings Found -->
      <div v-else class="text-center py-8">
        <i class="fas fa-search text-4xl text-gray-600 mb-3"></i>
        <div class="text-gray-400">{{ t("No listings found") }}</div>
        <div class="text-xs text-gray-500 mt-1">
          {{ t("This item may be rare or not currently being traded") }}
        </div>
      </div>

      <!-- Search Filters Info -->
      <div v-if="priceData.searchFilters" class="mt-4 text-xs text-gray-500 bg-gray-800 rounded p-2">
        <div class="font-medium mb-1">{{ t("Search Filters") }}:</div>
        <div class="grid grid-cols-2 gap-1">
          <div v-if="priceData.searchFilters.name">
            {{ t("Name") }}: {{ priceData.searchFilters.name }}
          </div>
          <div v-if="priceData.searchFilters.baseType">
            {{ t("Base Type") }}: {{ priceData.searchFilters.baseType }}
          </div>
          <div v-if="priceData.searchFilters.rarity">
            {{ t("Rarity") }}: {{ priceData.searchFilters.rarity }}
          </div>
          <div v-if="priceData.searchFilters.corrupted !== undefined">
            {{ t("Corrupted") }}: {{ priceData.searchFilters.corrupted ? "Yes" : "No" }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ParsedItem } from "@/parser";
import { restApiClient, PriceCheckResult, AnalyzeItemResponse } from "@/web/api/RestApiClient";
import { useLeagues } from "@/web/background/RestApiLeagues";
import { AppConfig } from "@/web/Config";
import { PriceCheckWidget } from "../overlay/interfaces";

export default defineComponent({
  name: "RestApiCheckedItem",
  props: {
    item: {
      type: Object as PropType<ParsedItem>,
      required: true,
    },
    advancedCheck: {
      type: Boolean,
      required: true,
    },
    rebuildKey: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const leagues = useLeagues();
    const widget = computed(() => AppConfig<PriceCheckWidget>("price-check")!);
    
    const isLoading = ref(false);
    const apiError = ref<string | null>(null);
    const priceData = ref<PriceCheckResult | null>(null);
    const recommendations = ref<AnalyzeItemResponse['data']['recommendations'] | null>(null);
    const apiConnected = ref(false);
    
    const show = computed(() => {
      return props.item != null;
    });

    // Check API connection
    async function checkApiConnection() {
      try {
        const result = await restApiClient.getHealth();
        apiConnected.value = result.isOk();
      } catch {
        apiConnected.value = false;
      }
    }

    async function performPriceCheck() {
      if (!props.item || !props.item.rawText) return;

      isLoading.value = true;
      apiError.value = null;
      priceData.value = null;
      recommendations.value = null;

      // Check API connection first
      await checkApiConnection();

      try {
        // Use the analyze endpoint for comprehensive data
        const result = await restApiClient.analyzeItem({
          itemText: props.item.rawText,
          league: leagues.selectedId.value || 'Rise of the Abyssal',
          includeMarketData: true,
          includeSimilarItems: false, // Keep simple for now
        });

        if (result.isOk()) {
          const data = result.value;
          
          // Extract price analysis data
          if (data.priceAnalysis) {
            priceData.value = data.priceAnalysis;
          }
          
          // Extract recommendations
          if (data.recommendations) {
            recommendations.value = data.recommendations;
          }
          
          // If no price analysis, show message
          if (!data.priceAnalysis) {
            apiError.value = "No pricing data available for this item";
          }

          apiConnected.value = true;
        } else {
          apiError.value = result.error;
        }
      } catch (error) {
        console.error("REST API error:", error);
        apiError.value = "Failed to connect to price check service";
        apiConnected.value = false;
      } finally {
        isLoading.value = false;
      }
    }

    function retryPriceCheck() {
      performPriceCheck();
    }

    // Watch for item changes and trigger price check
    watch(() => props.item, () => {
      if (props.item) {
        performPriceCheck();
      }
    }, { immediate: true });

    // Watch for rebuild key changes
    watch(() => props.rebuildKey, () => {
      if (props.item) {
        performPriceCheck();
      }
    });

    return {
      t,
      show,
      isLoading,
      apiError,
      priceData,
      recommendations,
      apiConnected,
      retryPriceCheck,
    };
  },
});
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55 65 81 / 0.5);
}
</style>