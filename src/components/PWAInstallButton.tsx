import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2a8549] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#23703d] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Instalar app</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#242422] px-3 py-1.5 text-xs font-medium text-[#1a1a18] dark:text-[#f0efe8] transition-colors hover:bg-black/5 dark:hover:bg-white/5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Instalar app</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#242422] p-6 shadow-xl border-t sm:border border-black/10 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20 sm:hidden" />
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#1a1a18] dark:text-[#f0efe8]">
                  Instalar en iPhone o iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#7a7a74] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2.5 text-sm text-[#4a4a45] dark:text-[#b5b4ac]">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a1a18] dark:bg-[#f0efe8] text-xs font-semibold text-white dark:text-[#1a1a18]">
                    1
                  </span>
                  <span>
                    Pulsa el botón <strong className="inline-flex items-center gap-1 font-medium text-[#1a1a18] dark:text-[#f0efe8]"><Share className="inline h-3.5 w-3.5" /> Compartir</strong> en la barra inferior de Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a1a18] dark:bg-[#f0efe8] text-xs font-semibold text-white dark:text-[#1a1a18]">
                    2
                  </span>
                  <span>
                    Desliza hacia abajo y selecciona <strong className="font-medium text-[#1a1a18] dark:text-[#f0efe8]">Añadir a pantalla de inicio</strong>.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#1a1a18] dark:bg-[#f0efe8] py-3 text-sm font-medium text-white dark:text-[#1a1a18] transition-opacity hover:opacity-90 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
