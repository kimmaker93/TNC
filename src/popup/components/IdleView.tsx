export function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="animate-pulse text-6xl mb-4">📰</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Team News Clipper</h2>
      <p className="text-sm text-gray-600 text-center">페이지 정보를 불러오는 중...</p>
    </div>
  );
}
