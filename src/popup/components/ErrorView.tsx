import { usePopupStore } from '../store';

export function ErrorView() {
  const { error, setState, setError } = usePopupStore();

  const handleRetry = () => {
    setError(null);
    setState('ready');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Error Icon */}
      <div className="text-6xl mb-4">❌</div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>

      {/* Error Message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-sm">
        <p className="text-sm text-red-800">{error || '알 수 없는 오류가 발생했습니다.'}</p>
      </div>

      {/* Actions */}
      <div className="space-y-2 w-full max-w-xs">
        <button
          onClick={handleRetry}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.close()}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        문제가 계속되면 페이지를 새로고침하거나
        <br />
        다른 페이지에서 시도해주세요.
      </p>
    </div>
  );
}
