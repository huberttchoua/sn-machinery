import React from 'react';
import { useTranslation, type Lang } from '../i18n-context';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={t('selectLanguage')}
        value={lang}
        onChange={(e) => {
          const nextLang = e.target.value as Lang;
          setLang(nextLang);
        }}
        className="border border-secondary-200 rounded-md px-2 py-1 text-sm bg-white"
      >
        <option value="en">{t('english')}</option>
        <option value="rw">{t('kinyarwanda')}</option>
        <option value="fr">{t('french')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
