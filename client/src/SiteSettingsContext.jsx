import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

export const SiteSettingsContext = createContext({
  settings: null,
  refreshSettings: async () => {},
});

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  const refreshSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/public`);
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to load site settings", error);
      setSettings(null);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
