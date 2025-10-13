export const AdminFooter = () => {
  const version = import.meta.env.VITE_APP_VERSION || '2.2.05.13';
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString();

  return (
    <div className="mt-auto pt-6 pb-4 px-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Twisted Hearth Foundation</span>
          <span className="hidden sm:inline">•</span>
          <span>Admin Panel v{version}</span>
        </div>
        <div>
          Built: {new Date(buildDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
