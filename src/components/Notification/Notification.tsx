import React from 'react';
import { toast, ToastPosition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const customToastStyle = {
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  fontFamily: 'Arial, sans-serif',
  fontSize: '0.875rem',
  fontWeight: '500',
};

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const options = {
    position: "bottom-right" as ToastPosition,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: 'dark:bg-gray-800 bg-white text-gray-700 dark:text-gray-200',
    bodyClassName: 'dark:bg-gray-800 bg-white text-gray-700 dark:text-gray-200',
    style: customToastStyle,
    theme: "light",
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    default:
      toast.info(message, options);
      break;
  }

  return null; // This component doesn't render anything
};

export default Notification;
