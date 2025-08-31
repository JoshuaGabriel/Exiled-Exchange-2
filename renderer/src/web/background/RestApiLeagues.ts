import { computed, shallowRef, readonly } from "vue";
import { createGlobalState } from "@vueuse/core";
import { AppConfig } from "@/web/Config";
import { restApiClient } from "@/web/api/RestApiClient";

interface League {
  id: string;
  isPopular: boolean;
  text: string;
}

export const useLeagues = createGlobalState(() => {
  const isLoading = shallowRef(false);
  const error = shallowRef<string | null>(null);
  const tradeLeagues = shallowRef<League[]>([]);

  const selectedId = computed<string | undefined>({
    get() {
      return tradeLeagues.value.length ? AppConfig().leagueId : undefined;
    },
    set(id) {
      AppConfig().leagueId = id;
    },
  });

  const selected = computed(() => {
    const { leagueId } = AppConfig();
    if (!tradeLeagues.value || !leagueId) return undefined;
    const listed = tradeLeagues.value.find((league) => league.id === leagueId);
    return {
      id: leagueId,
      realm: AppConfig().realm,
      isPopular: !isPrivateLeague(leagueId) && Boolean(listed?.isPopular),
    };
  });

  async function load() {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await restApiClient.getLeagues();
      
      if (result.isOk()) {
        tradeLeagues.value = result.value.map((league) => ({
          id: league.id,
          isPopular: true,
          text: league.text,
        }));

        const leagueIsAlive = tradeLeagues.value.some(
          (league) => league.id === selectedId.value,
        );
        
        if (!leagueIsAlive && !isPrivateLeague(selectedId.value ?? "")) {
          if (tradeLeagues.value.length > 0) {
            // Default to first league (likely the main challenge league)
            selectedId.value = tradeLeagues.value[0].id;
          }
        }
      } else {
        error.value = result.error;
        
        // Fallback to hardcoded PoE2 leagues if API fails
        console.warn("Failed to load leagues from API, using fallback:", result.error);
        tradeLeagues.value = [
          { id: "Rise of the Abyssal", text: "Rise of the Abyssal", isPopular: true },
          { id: "HC Rise of the Abyssal", text: "HC Rise of the Abyssal", isPopular: true },
          { id: "Standard", text: "Standard", isPopular: true },
          { id: "Hardcore", text: "Hardcore", isPopular: true },
        ];
        
        if (!selectedId.value) {
          selectedId.value = tradeLeagues.value[0].id;
        }
      }
    } catch (e) {
      error.value = (e as Error).message;
      console.error("League loading error:", e);
      
      // Fallback to hardcoded leagues
      tradeLeagues.value = [
        { id: "Rise of the Abyssal", text: "Rise of the Abyssal", isPopular: true },
        { id: "HC Rise of the Abyssal", text: "HC Rise of the Abyssal", isPopular: true },
        { id: "Standard", text: "Standard", isPopular: true },
        { id: "Hardcore", text: "Hardcore", isPopular: true },
      ];
      
      if (!selectedId.value) {
        selectedId.value = tradeLeagues.value[0].id;
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    selectedId,
    selected,
    list: readonly(tradeLeagues),
    load,
  };
});

function isPrivateLeague(id: string) {
  if (id.includes("Ruthless")) {
    return true;
  }
  return /\(PL\d+\)$/.test(id);
}