import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || 'Lỗi không xác định' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mind Clinic ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f6fbf9] flex items-center justify-center p-4 text-slate-800 font-['Quicksand',sans-serif]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-teal-100 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Đã khắc phục triệu chứng giao diện
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hệ thống đã tự động bảo vệ dữ liệu hồ sơ bệnh án của bạn. Nhấn nút bên dưới để khôi phục trạng thái làm việc bình thường.
            </p>
            {this.state.errorMessage && (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left overflow-auto max-h-24">
                <code>{this.state.errorMessage}</code>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-teal-100 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục & Tải lại ứng dụng</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
