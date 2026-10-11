/** @format */
import { Component, type ErrorInfo, type ReactNode } from "react";

// إن تعطّل جزء من الواجهة أثناء العرض (خطأ في الكود أو بيانات غير متوقعة):
// تظهر رسالة بدل صفحة بيضاء فارغة، ويُسجَّل الخطأ في Console
interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default ErrorBoundary;
