export function CatIcon({ icon: IconComp, size = 18, color, style }) {
  if (!IconComp) return null;
  return <IconComp size={size} color={color} style={style} />;
}
