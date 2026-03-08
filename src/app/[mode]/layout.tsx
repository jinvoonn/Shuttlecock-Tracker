import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { ADMIN_SECRET } from "@/lib/constants";

export default async function ModeLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ mode: string }>;
}) {
    const { mode } = await params;

    // Validate mode
    if (mode !== ADMIN_SECRET && mode !== "view") {
        redirect("/view");
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-50">
            <Navigation />
            <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
