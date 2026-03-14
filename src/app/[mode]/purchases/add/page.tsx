import DesktopAddNewStock from "@/stitch-designs/desktop/AddNewStock";
import MobileAddNewStock from "@/stitch-designs/mobile/AddNewStock";

export const revalidate = 0;

export default async function AddNewStockPage({ params }: { params: Promise<{ mode: string }> }) {
  await params;

  return (
    <>
      <div className="block lg:hidden">
        <MobileAddNewStock />
      </div>
      <div className="hidden lg:block">
        <DesktopAddNewStock />
      </div>
    </>
  );
}
