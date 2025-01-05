import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Tasks': 'Tasks',
      'Add Task': 'Add Task',
      'Custom Fields': 'Custom Fields',
      'Name': 'Name',
      'Description': 'Description',
      'Owner': 'Owner',
      'Start Date': 'Start Date',
      'Completion': 'Completion',
      'New Task': 'New Task'
    }
  },
  ar: {
    translation: {
      'Tasks': 'المهام',
      'Add Task': 'إضافة مهمة',
      'Custom Fields': 'حقول مخصصة',
      'Name': 'الاسم',
      'Description': 'الوصف',
      'Owner': 'المالك',
      'Start Date': 'تاريخ البدء',
      'Completion': 'نسبة الإنجاز',
      'New Task': 'مهمة جديدة'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;