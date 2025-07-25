export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex-1 md:p-10 max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  );
}
