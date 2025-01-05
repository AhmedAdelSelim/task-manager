import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Owner } from '../../types/task';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  owners: Owner[];
}

const STYLES = {
  overlay: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`,
  modal: `bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden`,
  header: `flex items-center justify-between p-4 border-b`,
  title: `text-xl font-semibold text-gray-800`,
  closeButton: `p-2 hover:bg-gray-100 rounded-lg transition-colors`,
  content: `p-6`,
  formGroup: `mb-4`,
  label: `block text-sm font-medium text-gray-700 mb-1`,
  input: `w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`,
  textarea: `w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]`,
  select: `w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`,
  footer: `flex justify-end gap-3 p-4 border-t bg-gray-50`,
  cancelButton: `px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100`,
  submitButton: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700`,
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  owners,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner_id: owners[0]?.id || '',
    start_date: new Date(),
    completion_percentage: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className={STYLES.overlay} onClick={onClose}>
      <div className={STYLES.modal} onClick={e => e.stopPropagation()}>
        <div className={STYLES.header}>
          <h2 className={STYLES.title}>{t('Add New Task')}</h2>
          <button onClick={onClose} className={STYLES.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={STYLES.content}>
            <div className={STYLES.formGroup}>
              <label className={STYLES.label}>{t('Task Name')}</label>
              <input
                type="text"
                required
                className={STYLES.input}
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className={STYLES.formGroup}>
              <label className={STYLES.label}>{t('Description')}</label>
              <textarea
                className={STYLES.textarea}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className={STYLES.formGroup}>
              <label className={STYLES.label}>{t('Owner')}</label>
              <select
                required
                className={STYLES.select}
                value={formData.owner_id}
                onChange={e => setFormData(prev => ({ ...prev, owner_id: e.target.value }))}
              >
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={STYLES.formGroup}>
              <label className={STYLES.label}>{t('Start Date')}</label>
              <DatePicker
                selected={formData.start_date}
                onChange={date => setFormData(prev => ({ ...prev, start_date: date }))}
                className={STYLES.input}
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className={STYLES.formGroup}>
              <label className={STYLES.label}>{t('Completion Percentage')}</label>
              <input
                type="number"
                min="0"
                max="100"
                className={STYLES.input}
                value={formData.completion_percentage}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  completion_percentage: parseInt(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          <div className={STYLES.footer}>
            <button
              type="button"
              onClick={onClose}
              className={STYLES.cancelButton}
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className={STYLES.submitButton}
              onClick={handleSubmit}
            >
              {t('Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 