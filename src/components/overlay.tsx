import { settingAtom, settingsEnum } from "#/lib/game-store";
import { useAtom } from "jotai";

export const Overlay = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  subtitleComponent,
  type = "game_over",
}: {
  type?: "ready" | "game_over" | "level_complete" | "won" | "paused";
  title: string;
  subtitle?: string;
  subtitleComponent?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  const [settings, setSettings] = useAtom(settingAtom);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60  text-white">
      <h2 className="text-6xl font-bold tracking-widest">{title}</h2>
      {subtitle && <p className="text-xl">{subtitle}</p>}
      {subtitleComponent && subtitleComponent}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded border border-white px-6 py-2 text-lg hover:bg-white hover:text-black"
        >
          {actionLabel}
        </button>
      )}

      {type === "paused" ? (
        <>
          <h3 className="text-4xl font-bold tracking-widest">Effects</h3>
          <div className="flex items-center gap-4">
            {Object.entries(settings).map(([key, value]) => {
              const settingKey = key as settingsEnum;
              return (
                <label
                  key={key}
                  className="flex gap-1 items-center cursor-pointer relative"
                >
                  <input
                    onChange={() =>
                      setSettings((prev) => ({
                        ...prev,
                        [settingKey]: !prev[settingKey],
                      }))
                    }
                    checked={value}
                    type="checkbox"
                    className="hidden peer"
                  />
                  <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:border-green-300"></span>
                  <svg
                    className="absolute hidden peer-checked:inline left-1 top-1/2 transform -translate-y-1/2"
                    width="11"
                    height="8"
                    viewBox="0 0 11 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="fill-green-200 stroke-green-200"
                      d="m10.092.952-.005-.006-.006-.005A.45.45 0 0 0 9.43.939L4.162 6.23 1.585 3.636a.45.45 0 0 0-.652 0 .47.47 0 0 0 0 .657l.002.002L3.58 6.958a.8.8 0 0 0 .567.242.78.78 0 0 0 .567-.242l5.333-5.356a.474.474 0 0 0 .044-.65Zm-5.86 5.349V6.3Z"
                      stroke-width=".4"
                    />
                  </svg>
                  <span className="text-gray-200 select-none">{key}</span>
                </label>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};
