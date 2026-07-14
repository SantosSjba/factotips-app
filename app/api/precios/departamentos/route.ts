import { listDepartamentos } from "@/lib/departamentos";
import { jsonOk } from "@/lib/api";

export function GET() {
  return jsonOk(listDepartamentos());
}
