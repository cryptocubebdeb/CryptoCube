"use client";

import { useTranslation } from 'react-i18next';

export default function PercentSection() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* Title */}
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        {t('percent.title')}
      </h2>

      {/* Placeholder */}
      <p className="text-sm text-slate-400">{t('percent.placeholder')}</p>

      <div className="mt-4 text-xs text-slate-500">
        • {t('percent.metricProfitLoss')}
        <br />
        • {t('percent.metricTotalReturn')}
        <br />
        • {t('percent.metricEquityCurve')}
        <br />
        • {t('percent.metricWinRate')}
        <br />
        • {t('percent.metricAvgGainLoss')}
      </div>
    </div>
  );
}
