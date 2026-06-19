export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-slate-50/50">
      <div className="text-center">
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <img
            src="/images/sansi-logo.png"
            alt="Sansi Eco Foods Logo"
            className="w-8 h-8 object-contain absolute"
          />
        </div>
        <p className="text-slate-500 text-xs font-semibold tracking-wider animate-pulse">
          LOADING...
        </p>
      </div>
    </div>
  );
}
