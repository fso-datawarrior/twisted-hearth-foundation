import packageJson from '../../../package.json';

export const AdminFooter = () => {
  const version = packageJson.version;
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString();
  const gitBranch = import.meta.env.VITE_GIT_BRANCH;

  return (
    <div className="mt-auto pt-6 pb-4 px-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Twisted Hearth Foundation</span>
          <span className="hidden sm:inline">•</span>
          <span>Admin Panel v{version}</span>
          {gitBranch && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-muted-foreground/70">{gitBranch}</span>
            </>
          )}
        </div>
        <div>
          Built: {new Date(buildDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
