import { supabase } from "@/lib/supabase";
import DesktopAddNewStock from "@/stitch-designs/desktop/AddNewStock";
import MobileAddNewStock from "@/stitch-designs/mobile/AddNewStock";

export const revalidate = 0;

export default async function AddNewStockPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;

  // Fetch brands from the database
  const { data: brands } = await supabase.from("brands").select("id, name").order("name");

  return (
    <>
      <div className="block lg:hidden">
        <MobileAddNewStock brands={brands || []} />
      </div>
      <div className="hidden lg:block">
        <DesktopAddNewStock brands={brands || []} />
      </div>
    </>
  );
}
