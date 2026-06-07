import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Lang, Translations } from './translations';
import { translations } from './translations';

interface LangCtx {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LangCtx>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('lang') as Lang) || 'en'; } catch { return 'en'; }
  });

  const toggleLang = () =>
    setLang(prev => {
      const next: Lang = prev === 'en' ? 'az' : 'en';
      try { localStorage.setItem('lang', next); } catch {}
      return next;
    });

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
