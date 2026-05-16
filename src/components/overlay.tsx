export const Overlay = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60  text-white">
      <h2 className="text-6xl font-bold tracking-widest">{title}</h2>
      {subtitle && <p className="text-xl">{subtitle}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded border border-white px-6 py-2 text-lg hover:bg-white hover:text-black"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
