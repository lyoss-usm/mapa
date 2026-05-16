import NavigationSideBar from "@/components/NavigationSideBar";

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-ui-50">
      <NavigationSideBar />
      <div id="map" className="relative h-full w-full flex items-center justify-center">
      </div>
    </main>
  );
}