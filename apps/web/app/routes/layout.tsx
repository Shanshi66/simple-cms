import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";
import { Outlet } from "react-router";

export default function PageLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
