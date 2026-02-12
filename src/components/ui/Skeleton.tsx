export default function Skeleton({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`relative overflow-hidden rounded-[var(--radius-md)] bg-border-dark/45 ${className}`}
            {...props}
        >
            <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] motion-safe:animate-[shimmer_1.4s_infinite]" />
            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}
