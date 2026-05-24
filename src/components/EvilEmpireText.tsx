import { Center, Text3D } from "@react-three/drei";
import fontGlyphs from "#/evil-empire-font";
import { TextMaterials } from "./TextMaterials";

type TextProps = {
  children: string;
  topMatcap?: string;
  color?: string;
} & Record<string, unknown>;

const TEXT_SCALE = 5;

const TEXT_3D_PROPS = {
  castShadow: true,
  bevelEnabled: true,
  scale: TEXT_SCALE,
  letterSpacing: -0.03,
  height: 0.25,
  bevelSize: 0.01,
  bevelSegments: 10,
  curveSegments: 128,
  bevelThickness: 0.01,
} as const;

export function EvilEmpireText({
  children,
  topMatcap,
  color,
  ...props
}: TextProps) {
  return (
    <Center scale={[0.8, 1, 1]} front top {...props}>
      <Text3D {...TEXT_3D_PROPS} font={fontGlyphs as never}>
        {children}
        <TextMaterials topMatcap={topMatcap} color={color} />
      </Text3D>
    </Center>
  );
}
