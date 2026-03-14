import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
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
        <div className="min-h-screen text-slate-100">
            <Navigation />
            <MobileNav />
            <main className="md:ml-64 p-4 pb-32 md:pb-8 animate-in fade-in duration-1000">
                {children}
            </main>
        </div>
    );
}
