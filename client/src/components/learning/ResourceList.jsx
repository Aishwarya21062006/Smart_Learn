import { Video, FileText, File, ExternalLink, Link as LinkIcon } from 'lucide-react';

export const ResourceList = ({ resources = [] }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 text-center">
        No external resources attached to this topic yet.
      </div>
    );
  }

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'article':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <File className="w-4 h-4 text-amber-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-teal-500" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'video':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'article':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pdf':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="space-y-2.5">
      {resources.map((item) => (
        <a
          key={item.id || item.url}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-teal-50 transition-colors shrink-0">
              {getResourceIcon(item.type)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700">
                {item.title}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {item.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-md border ${getBadgeStyle(item.type)}`}>
              {item.type}
            </span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </a>
      ))}
    </div>
  );
};

export default ResourceList;
