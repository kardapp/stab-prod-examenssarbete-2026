import { Suspense } from "react";
import { OutpatientDimensioningView } from "@/features/outpatient-dimensioning/sections/outpatient-dimensioning-view";

export default function OutpatientDimensioningPage() {
  return (
    <Suspense fallback={null}>
      <OutpatientDimensioningView />
    </Suspense>
  );
}
