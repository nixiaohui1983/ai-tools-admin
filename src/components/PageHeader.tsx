import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {extra && <div className="flex items-center gap-3">{extra}</div>}
    </div>
  );
}
