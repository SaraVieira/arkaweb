import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import defaultTopMatcap from "@pmndrs/assets/matcaps/0029.webp";
import { MeshTransmissionMaterial } from "./MeshTransmissionMaterial";

type TextMaterialsProps = {
  topMatcap?: string;
  color?: string;
  single?: boolean;
};

export function TextMaterials({
  topMatcap = defaultTopMatcap,
  color = "pink",
  single = false,
}: TextMaterialsProps = {}) {
  const top = useLoader(TextureLoader, topMatcap);
  if (single) {
    return <meshMatcapMaterial matcap={top} />;
  }
  return (
    <>
      <meshMatcapMaterial attach="material-0" matcap={top} />
      <MeshTransmissionMaterial
        attach="material-1"
        color={color}
        thickness={0.5}
        transmission={1}
        roughness={0.1}
        ior={1.5}
        chromaticAberration={0.05}
      />
    </>
  );
}
