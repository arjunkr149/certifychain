import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type} show`} id="toast">
      <i
        className={toast.type === 'success' ? 'ti ti-check-circle' : 'ti ti-alert-circle'}
        id="toast-icon"
      ></i>
      <span id="toast-msg">{toast.message}</span>
    </div>
  );
};
