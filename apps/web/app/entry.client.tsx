import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, i18nResources } from "./i18n";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

await i18next
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    detection: { order: ["htmlTag"], caches: [] },
    resources: i18nResources,
  });

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <I18nextProvider i18n={i18next}>
        <HydratedRouter />
      </I18nextProvider>
    </StrictMode>,
  );
});
