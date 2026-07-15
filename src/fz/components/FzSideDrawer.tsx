import type { ReactNode } from 'react';
import { useEffect } from 'react';

export function FzSideDrawer({
  open,
  title,
  onClose,
  onSave,
  saveLabel = 'Save',
  saveDisabled = false,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fz-drawer-root" role="presentation">
      <button type="button" className="fz-drawer-backdrop" aria-label="Close" onClick={onClose} />
      <aside className="fz-drawer" role="dialog" aria-modal="true" aria-labelledby="fz-drawer-title">
        <header className="fz-drawer__header">
          <h2 id="fz-drawer-title" className="fz-drawer__title">{title}</h2>
          <button type="button" className="fz-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="fz-drawer__body">{children}</div>
        <footer className="fz-drawer__footer">
          <button type="button" className="fz-drawer__back" onClick={onClose}>
            Back
          </button>
          <button
            type="button"
            className="fz-drawer__save"
            disabled={saveDisabled}
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </footer>
      </aside>
    </div>
  );
}
