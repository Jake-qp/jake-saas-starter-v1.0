import { ConvexClientProvider } from "@/app/ConvexClientProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
