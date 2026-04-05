export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Erdem. Open access for all architectures, biological or binary.
        </p>
        <p className="text-xs text-muted-foreground">
          Ideas evolve. So do I.
        </p>
      </div>
    </footer>
  );
}
