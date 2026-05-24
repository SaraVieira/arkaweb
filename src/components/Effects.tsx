import { settingAtom } from "#/lib/game-store";
import { useOutlineSelection } from "#/lib/outline-selection";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Outline,
  Scanline,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { useAtomValue } from "jotai";
import { BlendFunction, KernelSize, ToneMappingMode } from "postprocessing";
import { Fragment } from "react/jsx-runtime";
import { Vector2 } from "three";

export const Effects = () => {
  const settings = useAtomValue(settingAtom);
  const outlineSelection = useOutlineSelection();

  const effectsToShow = {
    Bloom: {
      enabled: settings.bloom,
      component: (
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={1} height={300} />
      ),
    },
    ToneMapping: {
      enabled: true,
      component: <ToneMapping mode={ToneMappingMode.CINEON} />,
    },
    Outline: {
      enabled: settings.outline,
      component: (
        <Outline
          selection={outlineSelection}
          edgeStrength={3}
          pulseSpeed={0.1}
          visibleEdgeColor={0x00ff00}
          kernelSize={KernelSize.VERY_SMALL}
          blur={false}
          xRay={true}
        />
      ),
    },
    Vignette: {
      enabled: settings.vignette,
      component: <Vignette eskil={false} offset={0.1} darkness={0.8} />,
    },
    ChromaticAberration: {
      enabled: settings.chromaticAberration,
      component: <ChromaticAberration offset={new Vector2(0.0008, 0.0008)} />,
    },
    Scanline: {
      enabled: settings.scanline,
      component: (
        <Scanline
          blendFunction={BlendFunction.OVERLAY}
          density={1.25}
          opacity={0.1}
        />
      ),
    },
  };
  return (
    <EffectComposer autoClear={false}>
      {Object.entries(effectsToShow).map(([key, { enabled, component }]) =>
        enabled ? <Fragment key={key}>{component}</Fragment> : <></>,
      )}
    </EffectComposer>
  );
};
