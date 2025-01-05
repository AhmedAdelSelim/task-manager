import React, { useState, useEffect } from 'react';
import { Task, Owner, CustomField } from '../../types/task';
import { TaskRow } from './TaskRow';
import { Plus, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { wsService } from '../../services/websocketService';
import { apiService } from '../../services/apiService';
import { AddTaskModal } from './AddTaskModal';

const STYLES = {
  container: `container mx-auto p-4 sm:p-6 max-w-7xl`,
  header: `flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6`,
  title: `text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight`,
  buttonGroup: `flex w-full sm:w-auto gap-2 sm:gap-3`,
  primaryButton: `flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
    bg-blue-600 text-white text-sm sm:text-base rounded-lg
    hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md`,
  secondaryButton: `flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
    border border-gray-300 text-sm sm:text-base rounded-lg
    hover:bg-gray-50 transition-all duration-200 text-gray-700`,
  gridContainer: `bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100`,
  gridWrapper: `min-w-[800px]`,
  gridHeader: `grid grid-cols-5 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 border-b border-gray-200`,
  headerCell: `text-xs sm:text-sm font-semibold text-gray-600 tracking-wide px-2`,
  taskList: `divide-y divide-gray-100`,
};

export const TaskGrid: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [tasksData, ownersData, customFieldsData] = await Promise.all([
          apiService.getTasks(),
          apiService.getOwners(),
          apiService.getCustomFields()
        ]);

        setTasks(tasksData);
        setOwners(ownersData);
        setCustomFields(customFieldsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification({
          type: 'error',
          message: t('Failed to load data')
        });
      }
    };

    fetchData();

    // Subscribe to WebSocket updates
    wsService.connect();
    const unsubscribe = wsService.subscribe((message) => {
      if (message.type === 'TASK_UPDATE') {
        setTasks(prev => prev.map(task => 
          task.id === message.payload.id ? message.payload : task
        ));
      } else if (message.type === 'TASK_CREATED') {
        setTasks(prev => [...prev, message.payload]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [t]);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );

      const updatedTask = await apiService.updateTask(taskId, updates);
      
      wsService.send('TASK_UPDATE', updatedTask);

    } catch (error) {
      console.error('Error updating task:', error);
      const task = await apiService.getTasks().then(tasks => 
        tasks.find(t => t.id === taskId)
      );
      
      if (task) {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? task : t
          )
        );
      }

      showNotification({
        type: 'error',
        message: t('Failed to update task')
      });
    }
  };

  const addNewTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await apiService.createTask(taskData);
      wsService.send('TASK_CREATED', newTask);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      showNotification({
        type: 'error',
        message: t('Failed to create task')
      });
    }
  };

  const showNotification = ({ type, message }: { type: string, message: string }) => {
    console.log(`${type}: ${message}`);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const renderTaskHierarchy = (parentId: string | null = null, level: number = 0) => {
    const childTasks = tasks.filter(task => task.parent_id === parentId);
    
    return childTasks.map(task => (
      <React.Fragment key={task.id}>
        <TaskRow
          task={task}
          level={level}
          owners={owners}
          expanded={expandedTasks.has(task.id)}
          onToggle={() => toggleTaskExpansion(task.id)}
          onUpdate={handleTaskUpdate}
        />
        {expandedTasks.has(task.id) && renderTaskHierarchy(task.id, level + 1)}
      </React.Fragment>
    ));
  };

  const columnHeaders = [
    { id: 'name', label: t('Name') },
    { id: 'description', label: t('Description') },
    { id: 'owner', label: t('Owner') },
    { id: 'startDate', label: t('Start Date') },
    { id: 'completion', label: t('Completion') },
  ];

  const orderedHeaders = i18n.dir() === 'rtl' ? [...columnHeaders].reverse() : columnHeaders;

  return (
    <div className={`${STYLES.container} ${i18n.dir()}`}>
      <div className={STYLES.header}>
        {i18n.dir() === 'rtl' ? (
          <>
            <div className={STYLES.buttonGroup}>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={STYLES.primaryButton}
              >
                <Plus size={18} />
                {t('Add Task')}
              </button>
              <button className={STYLES.secondaryButton}>
                <Settings size={18} />
                {t('Custom Fields')}
              </button>
            </div>
            <h1 className={STYLES.title}>{t('Tasks')}</h1>
          </>
        ) : (
          <>
            <h1 className={STYLES.title}>{t('Tasks')}</h1>
            <div className={STYLES.buttonGroup}>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={STYLES.primaryButton}
              >
                <Plus size={18} />
                {t('Add Task')}
              </button>
              <button className={STYLES.secondaryButton}>
                <Settings size={18} />
                {t('Custom Fields')}
              </button>
            </div>
          </>
        )}
      </div>

      <div className={STYLES.gridContainer}>
        <div className={STYLES.gridWrapper}>
          <div className={STYLES.gridHeader}>
            {orderedHeaders.map(header => (
              <div key={header.id} className={STYLES.headerCell}>
                {header.label}
              </div>
            ))}
          </div>
          <div className={STYLES.taskList}>
            {renderTaskHierarchy()}
          </div>
        </div>
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addNewTask}
        owners={owners}
      />
    </div>
  );
};