import { Skeleton } from "@/components/common/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-blackshark-background text-blackshark-primary">
      <Skeleton className="hidden md:block w-[280px] h-screen border-r border-blackshark-accent bg-blackshark-card" />
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-40 w-full h-16 border-b border-blackshark-accent bg-blackshark-card/90 backdrop-blur">
          <div className="container flex items-center justify-between h-16 px-4 md:px-8 max-w-screen-2xl">
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 md:hidden bg-blackshark-accent/20" />
              <Skeleton className="w-40 h-8 bg-blackshark-accent/20" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full bg-blackshark-accent/20" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container flex-1 p-4 mx-auto space-y-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-32 border rounded-none bg-blackshark-card/50 border-blackshark-accent"
                />
              ))}
            </div>
            <Skeleton className="border rounded-none h-96 bg-blackshark-card/50 border-blackshark-accent" />
            <Skeleton className="h-64 border rounded-none bg-blackshark-card/50 border-blackshark-accent" />
          </div>
        </main>
      </div>
    </div>
  );
}
