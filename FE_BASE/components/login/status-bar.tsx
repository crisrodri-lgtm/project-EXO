export function StatusBar() {
  return (
    <footer className="border-t border-gray-300 bg-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-3 text-xs text-gray-700 sm:flex-row sm:justify-between md:px-8 md:text-sm">
        <p className="inline-flex items-center gap-2 rounded-full border border-green-700 bg-white px-3 py-1 font-medium text-green-800">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-green-600" />
          Conexión Cifrada SSL/TLS 1.3
        </p>
        <p className="text-center">
          CDEB-PD Los Alcarrizos <span aria-hidden="true">·</span> Ley 172-13
        </p>
      </div>
    </footer>
  )
}
