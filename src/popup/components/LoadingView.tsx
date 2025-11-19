export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">AI 분석 중...</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        페이지 내용을 요약하고 있습니다.
        <br />
        잠시만 기다려주세요.
      </p>

      {/* Progress Steps */}
      <div className="w-full max-w-xs space-y-2">
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-700">페이지 분석 완료</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-gray-700">AI 요약 생성 중...</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
          <span className="text-gray-400">결과 준비</span>
        </div>
      </div>
    </div>
  );
}
