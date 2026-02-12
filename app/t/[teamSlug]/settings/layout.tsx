export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-3xl flex flex-col gap-6">{children}</div>;
}
