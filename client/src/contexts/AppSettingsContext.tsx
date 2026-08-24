import { createContext, useContext, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";

type AppTheme = "dark" | "light" | "system";
export type AppSettings = { id: number; appName: string; tagline: string; theme: AppTheme; accentColor: string; updatedBy: number | null };

const fallbackAppSettings: AppSettings = { id: 1, appName: "Luna Social", tagline: "Find your people under the same sky.", theme: "dark", accentColor: "#a98cff", updatedBy: null };

type AppSettingsContextValue = {
  settings: AppSettings;
  isLoading: boolean;
  isSaving: boolean;
  save: (input: Partial<Pick<AppSettings, "appName" | "tagline" | "theme" | "accentColor">>) => Promise<AppSettings>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function applyAppSettings(settings: AppSettings) {
  const root = document.documentElement;
  root.dataset.appTheme = settings.theme;
  root.style.setProperty("--app-accent", settings.accentColor);
  root.style.setProperty("--primary", settings.accentColor);
  root.style.setProperty("--ring", settings.accentColor);
  document.title = settings.appName;
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const query = trpc.social.appSettings.useQuery();
  const mutation = trpc.social.updateAppSettings.useMutation();
  const settings = query.data || fallbackAppSettings;

  useEffect(() => { applyAppSettings(settings); }, [settings]);

  const value = useMemo<AppSettingsContextValue>(() => ({
    settings,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    save: async input => {
      const saved = await mutation.mutateAsync(input);
      applyAppSettings(saved);
      await query.refetch();
      return saved;
    },
  }), [mutation, query, settings]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return context;
}

export { fallbackAppSettings };

