'use client';

import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { toast, ToastBar, Toaster, ToastOptions } from 'react-hot-toast';

// Example usage on a button: onClick={() => showToast('Success!', SuccessToast)}

export default function Toast() {
  return (
    <div>
      <Toaster
        reverseOrder={false}
        position='top-center'
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#E8F0E0',
            color: '#8AB364',
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {/* <Typography variant='bs' weight='bold' font='plusJakarta'> */}
                {message}
                {/* </Typography> */}
                {t.type !== 'loading' && (
                  <button
                    className='rounded-full p-1 ring-primary-400 transition focus:outline-none focus-visible:ring'
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <X className='h-4 w-4 md:h-5 md:w-5' />
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </div>
  );
}

const createCustomToast = (options: ToastOptions) => {
  return { ...options };
};

const showToast = (message: string, options: ToastOptions) => {
  return toast(message, options);
};

export { createCustomToast, showToast };

const styledToast =
  'w-[295px] md:w-[375px] [&>div]:justify-start md:!px-4 md:!py-3 !px-3 !py-2';

const iconStyle = 'md:w-6 md:h-6 w-5 h-5';

const INFO_TOAST = createCustomToast({
  style: {
    background: '#0D88DD',
    color: '#FFFFFF',
  },
  icon: <Info className={iconStyle} />,
  className: styledToast,
  position: 'top-center',
  duration: 3000,
});

const SUCCESS_TOAST = createCustomToast({
  style: {
    background: '#1EC782',
    color: '#FFFFFF',
  },
  icon: <CheckCircle className={iconStyle} />,
  className: styledToast,
  position: 'top-center',
  duration: 3000,
});

const DANGER_TOAST = createCustomToast({
  style: {
    background: '#C3394C',
    color: '#FFFFFF',
  },
  icon: <XCircle className={iconStyle} />,
  className: styledToast,
  position: 'top-center',
  duration: 3000,
});

const WARNING_TOAST = createCustomToast({
  style: {
    background: '#FF8834',
    color: '#FFFFFF',
  },
  icon: <AlertTriangle className={iconStyle} />,
  className: styledToast,
  position: 'top-center',
  duration: 3000,
});

export { DANGER_TOAST, INFO_TOAST, SUCCESS_TOAST, WARNING_TOAST };
