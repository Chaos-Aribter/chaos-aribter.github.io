import { NewsLoader } from "./news-loader";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<NewsLoader /></>;
}
