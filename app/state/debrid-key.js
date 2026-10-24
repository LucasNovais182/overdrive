import { useEffect, useState } from 'react';
import { loadList, saveList } from './saved.js';
import { t } from '../i18n/core.js';
import { Http } from '@ps5-react/core';

  // The user's Real-Debrid API token, kept in settings.json beside the other settings. Empty is unset.
  var SETTINGS = "settings.json";
  var key = typeof loadList(SETTINGS, "settings").realDebridKey === "string" ? loadList(SETTINGS, "settings").realDebridKey : "";
  var listeners = /* @__PURE__ */ new Set();
  // Asks Real-Debrid who the token belongs to: 200 is a valid key, 401 a wrong one, 403 a locked account.
  async function validateDebridKey(value) {
    const response = await Http.request("https://api.real-debrid.com/rest/1.0/user", { headers: { Authorization: `Bearer ${value}`, Accept: "application/json", "User-Agent": "Overdrive" }, maxBytes: 64 * 1024 });
    if (response.status === 401) throw new Error(t("settings.debridKeyInvalid"));
    if (response.status === 403) throw new Error(t("settings.debridKeyLocked"));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }
  // Saves the token once Real-Debrid accepts it; an empty one removes it without asking.
  async function submitDebridKey(value) {
    const next = value.trim();
    if (next) await validateDebridKey(next);
    setDebridKey(next);
  }
  function setDebridKey(value) {
    key = value.trim();
    const { realDebridKey: _old, ...settings } = loadList(SETTINGS, "settings");
    saveList(SETTINGS, "settings", key ? { ...settings, realDebridKey: key } : settings);
    for (const listener of listeners) listener(key);
  }
  function useDebridKey() {
    const [value, setValue] = (0, useState)(key);
    (0, useEffect)(() => {
      listeners.add(setValue);
      return () => {
        listeners.delete(setValue);
      };
    }, []);
    return value;
  }
  var getDebridKey = () => key;

export { getDebridKey, setDebridKey, submitDebridKey, useDebridKey };
