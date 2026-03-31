import { createContext, useContext } from 'react';

export type Lang = 'en' | 'rw' | 'fr';

export type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export const useTranslation = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
};
