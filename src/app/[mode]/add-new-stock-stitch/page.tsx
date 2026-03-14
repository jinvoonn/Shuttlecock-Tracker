import MobileAddNewStock from "@/stitch-designs/mobile/AddNewStock";

export default async function AddNewStockStitchPage({ 
  params 
}: { 
  params: Promise<{ mode: string }> 
}) {
  await params;
  
  return (
    <MobileAddNewStock />
  );
}
