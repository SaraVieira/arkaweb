import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Scanline,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, Resolution, ToneMappingMode } from "postprocessing";
import { Vector2 } from "three";

export const Effects = () => (
  <EffectComposer autoClear={false}>
    <Bloom
      luminanceThreshold={0.4}
      luminanceSmoothing={1}
      resolutionX={Resolution.AUTO_SIZE}
      resolutionY={Resolution.AUTO_SIZE}
    />
    <ToneMapping mode={ToneMappingMode.CINEON} />
    <Vignette eskil={false} offset={0.1} darkness={0.8} />
    <ChromaticAberration offset={new Vector2(0.0008, 0.0008)} />
    <Scanline
      blendFunction={BlendFunction.OVERLAY}
      density={1.25}
      opacity={0.1}
    />
  </EffectComposer>
);
