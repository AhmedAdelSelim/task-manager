import React from 'react';
import { Task, Owner } from '../../types/task';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronDown, Circle } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

interface TaskRowProps {
  task: Task;
  level: number;
  owners: Owner[];
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const STYLES = {
  row: `grid grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 items-center`,
  nameCell: `flex items-center gap-1 sm:gap-2`,
  toggleButton: `p-0.5 sm:p-1 hover:bg-gray-200 rounded`,
  input: `w-full p-1 sm:p-1.5 text-sm sm:text-base border rounded`,
  textarea: `w-full p-1 sm:p-1.5 text-sm sm:text-base border rounded`,
  select: `w-full p-1 sm:p-1.5 text-sm sm:text-base border rounded`,
  datePicker: `w-full p-1 sm:p-1.5 text-sm sm:text-base border rounded`,
  numberInput: `w-full p-1 sm:p-1.5 text-sm sm:text-base border rounded`,
  completionCell: `flex items-center gap-2`,
  completionWrapper: `flex-1 h-6 bg-gray-100 rounded-full overflow-hidden`,
  completionBar: `h-full transition-all duration-300 rounded-full`,
  completionText: `text-sm font-medium min-w-[3rem] text-right`,
  completionInput: `w-16 p-1 text-sm border rounded text-center`,
};

// Helper function to get completion color
const getCompletionColor = (percentage: number): string => {
  if (percentage === 100) return 'bg-green-500';
  if (percentage >= 70) return 'bg-emerald-400';
  if (percentage >= 50) return 'bg-yellow-400';
  if (percentage >= 30) return 'bg-orange-400';
  return 'bg-red-400';
};

// Helper function to get status indicator color
const getStatusColor = (percentage: number): string => {
  if (percentage === 100) return 'text-green-500';
  if (percentage >= 70) return 'text-emerald-400';
  if (percentage >= 50) return 'text-yellow-400';
  if (percentage >= 30) return 'text-orange-400';
  return 'text-red-400';
};

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  level,
  owners,
  expanded,
  onToggle,
  onUpdate,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Responsive indentation calculation
  const baseIndent = 0.5; // Base indentation in rem
  const levelIndent = 1.5; // Indentation per level in rem
  
  const indentationStyle = {
    ...(isRTL 
      ? { paddingRight: `${(level * levelIndent) + baseIndent}rem` }
      : { paddingLeft: `${(level * levelIndent) + baseIndent}rem` }
    )
  };

  const borderClass = level > 0
    ? isRTL
      ? 'border-r-2 border-gray-200'
      : 'border-l-2 border-gray-200'
    : '';

  // Replace the completion input with this new version
  const renderCompletionCell = () => {
    const percentage = task.completion_percentage;
    const completionColor = getCompletionColor(percentage);
    const statusColor = getStatusColor(percentage);

    return (
      <div className={STYLES.completionCell}>
        <Circle 
          size={16} 
          className={`${statusColor} fill-current`}
        />
        <div className={STYLES.completionWrapper}>
          <div
            className={`${STYLES.completionBar} ${completionColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className={STYLES.completionText}>
          {percentage}%
        </div>
        <input
          type="number"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => {
            const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
            onUpdate(task.id, { completion_percentage: value });
          }}
          className={STYLES.completionInput}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          dir={i18n.dir()}
        />
      </div>
    );
  };

  return (
    <div 
      className={`${STYLES.row} ${borderClass}`}
      style={indentationStyle}
      dir={i18n.dir()}
    >
      <div className={`${STYLES.nameCell} ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button 
          onClick={onToggle}
          className={STYLES.toggleButton}
        >
          {expanded ? (
            <ChevronDown size={14} className="sm:w-4 sm:h-4" />
          ) : (
            <ChevronRight 
              size={14}
              className={`sm:w-4 sm:h-4 ${isRTL ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        <input
          value={task.name}
          onChange={(e) => onUpdate(task.id, { name: e.target.value })}
          className={STYLES.input}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          dir={i18n.dir()}
        />
      </div>
      
      <textarea
        value={task.description}
        onChange={(e) => onUpdate(task.id, { description: e.target.value })}
        className={STYLES.textarea}
        rows={1}
        style={{ textAlign: isRTL ? 'right' : 'left' }}
        dir={i18n.dir()}
      />
      
      <select
        value={task.owner_id}
        onChange={(e) => onUpdate(task.id, { owner_id: e.target.value })}
        className={STYLES.select}
        style={{ textAlign: isRTL ? 'right' : 'left' }}
        dir={i18n.dir()}
      >
        {owners.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.name}
          </option>
        ))}
      </select>
      
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <DatePicker
          selected={new Date(task.start_date)}
          onChange={(date) => onUpdate(task.id, { start_date: date?.toISOString() })}
          className={STYLES.datePicker}
          dateFormat="yyyy-MM-dd"
          dir={i18n.dir()}
        />
      </div>
      
      {renderCompletionCell()}
    </div>
  );
};