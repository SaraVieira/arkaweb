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
import { BlendFunction, KernelSize, ToneMappingMode } from "postprocessing";
import { Vector2 } from "three";

export const Effects = () => {
  const outlineSelection = useOutlineSelection();
  return (
    <EffectComposer autoClear={false}>
      <Bloom luminanceThreshold={0.4} luminanceSmoothing={1} height={300} />
      <ToneMapping mode={ToneMappingMode.CINEON} />

      <Outline
        selection={outlineSelection}
        edgeStrength={3}
        pulseSpeed={0.1}
        visibleEdgeColor={0x00ff00}
        kernelSize={KernelSize.VERY_SMALL}
        blur={false}
        xRay={true}
      />
      <Vignette eskil={false} offset={0.1} darkness={0.8} />

      <ChromaticAberration offset={new Vector2(0.0008, 0.0008)} />
      <Scanline
        blendFunction={BlendFunction.OVERLAY}
        density={1.25}
        opacity={0.1}
      />
    </EffectComposer>
  );
};
