function StatCard({
  title,
  value,
  trend,
  icon,
  color,
}) {

  return (
    <div className="
      relative
      overflow-hidden
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      rounded-3xl
      p-6
      shadow-[0_0_30px_rgba(0,0,0,0.3)]
      hover:scale-[1.02]
      transition-all
      duration-300
    ">

      {/* Glow */}
      <div className={`
        absolute
        w-32 h-32
        ${color}
        opacity-20
        blur-3xl
        rounded-full
        -top-10
        -right-10
      `}></div>

      <div className="relative z-10">

        <div className="flex justify-between items-center">

          <div>

            <p className="text-gray-400 text-sm">
              {title}
            </p>

            <h1 className="text-4xl font-bold mt-3">
              {value}
            </h1>

          </div>

          <div className={`
            w-14 h-14
            rounded-2xl
            ${color}
            flex items-center justify-center
          `}>
            {icon}
          </div>

        </div>

        {trend && (
          <div className="mt-6 flex justify-between">
            <p className={`${trend.startsWith("-") ? "text-red-400" : "text-emerald-400"} text-sm font-bold`}>
              {trend.startsWith("-") || trend.startsWith("↑") || trend.startsWith("↓") ? trend : `↑ ${trend}`}
            </p>
            <p className="text-gray-500 text-sm">
              vs baseline
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

export default StatCard;