"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useMatchNotifications } from "@/lib/useNotifications";
import styles from "./layout.module.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  useMatchNotifications();

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>
      <main className={styles.main}>
        {children}
      </main>
      <div className={styles.bottomNav}>
        <BottomNav />
      </div>
    </div>
  );
}
