import { usePopupStore } from '../store';
import { summarize } from '../api';

export function ReadyView() {
  const { pageContent, setState, setSummaryData, setError, usage, settings, incrementUsage } =
    usePopupStore();

  const handleStart = async () => {
    if (!pageContent) return;

    // 사용량 체크
    if (usage.remaining <= 0) {
      setError('일일 무료 사용 횟수를 모두 사용했습니다. 내일 다시 시도해주세요.');
      setState('error');
      return;
    }

    try {
      setState('loading');
      setError(null);

      // API 호출
      const response = await summarize({
        content: pageContent.content,
        title: pageContent.title,
        url: pageContent.url,
        mode: settings.summaryConfig.mode,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || '요약 생성에 실패했습니다.');
      }

      // 결과 저장
      setSummaryData({
        summary: response.data.summary,
        keywords: response.data.keywords || [],
        insight: response.data.insight || '',
        comment: '',
      });

      // 사용량 증가
      await incrementUsage();

      setState('complete');
    } catch (error) {
      console.error('[TNC] Summarize error:', error);
      setError(error instanceof Error ? error.message : '요약 생성에 실패했습니다.');
      setState('error');
    }
  };

  if (!pageContent) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-600">페이지 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4">
        <h1 className="text-lg font-bold">Team News Clipper</h1>
        <p className="text-sm opacity-90">페이지 요약 준비 완료</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">현재 페이지</h3>
          <p className="text-sm text-gray-700 mb-1 line-clamp-2">{pageContent.title}</p>
          <p className="text-xs text-gray-500 truncate">{pageContent.url}</p>
          <p className="text-xs text-gray-500 mt-2">단어 수: {pageContent.wordCount}개</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 안내:</span> 요약 시작 버튼을 누르면 AI가 이
            페이지를 분석합니다.
          </p>
        </div>

        {/* Usage Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">오늘 남은 무료 횟수</span>
            <span className="font-bold text-primary-600">
              {usage.remaining}/{usage.used + usage.remaining}회
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={handleStart}
          disabled={usage.remaining <= 0}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {usage.remaining > 0 ? '✨ 요약 시작' : '무료 횟수 소진'}
        </button>
      </div>
    </div>
  );
}
