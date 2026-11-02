import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  label,
  value,
  subtext,
  trendLabel,
  trendPositive = true,
  icon: Icon,
  accentColor = '#050FD8',
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay }}
      className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#050FD8]/25 transition-all flex flex-col justify-between group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-neutral-500 truncate">
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${accentColor}10`,
              color: accentColor,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-2.5">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#0D0D0D] font-mono-num truncate">
          {value}
        </div>
      </div>

      <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2 text-[11px]">
        {trendLabel ? (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold tabular-nums truncate ${
              trendPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trendPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{trendLabel}</span>
          </span>
        ) : (
          <span className="text-neutral-400">Live</span>
        )}
        {subtext && (
          <span className="text-neutral-400 truncate text-right">{subtext}</span>
        )}
      </div>
    </motion.div>
  );
}
