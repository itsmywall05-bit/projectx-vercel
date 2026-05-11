import { PageIntro, Highlight } from "@/components/ui";
import MapCanvas from "@/components/map/MapCanvas";

export default function TheMapPage() {
  return (
    <>
      <PageIntro>Your entire trading universe. Spatial overview — each zone drills into detail.</PageIntro>
      <Highlight>Drag to pan · Scroll or +/− to zoom · Click any zone to navigate · Map evolves as modules activate</Highlight>
      <MapCanvas />
    </>
  );
}
