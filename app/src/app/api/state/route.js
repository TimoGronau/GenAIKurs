import { handle } from "@/lib/api";
import { readData } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(() => readData());
}
