import Link from "next/link";

interface VersionDot {
  number: number;
  date: string;
  isDeleted: boolean;
  isCurrent: boolean;
}

export function VersionTimeline({
  versions,
  baseUrl,
}: {
  versions: VersionDot[];
  baseUrl: string;
}) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-4 border-t border-b border-border">
      {versions.map((v, index) => (
        <div key={v.number} className="flex items-center">
          {index > 0 && <div className="w-10 h-0.5 bg-border flex-shrink-0" />}
          <Link
            href={v.isCurrent ? baseUrl : `${baseUrl}/v/${v.number}`}
            className="flex flex-col items-center gap-1 flex-shrink-0 px-2 group"
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all group-hover:scale-125 ${
                v.isCurrent
                  ? "bg-blue-500 border-blue-500 w-4 h-4"
                  : v.isDeleted
                  ? "bg-white border-red-300 border-dashed"
                  : "bg-white border-gray-300 group-hover:border-blue-300"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                v.isCurrent ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              v{v.number}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(v.date).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              })}
            </span>
            {v.isDeleted && (
              <span className="text-xs text-red-400">removed</span>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
