import React from 'react';

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4 md:my-6">
      <div className="bg-white shadow-soft border border-neutral-200 rounded-full px-3 md:px-4 py-1.5 md:py-2">
        <span className="text-xs md:text-sm font-medium text-neutral-600">
          {date}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;
