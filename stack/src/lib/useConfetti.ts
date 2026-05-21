import confetti from "canvas-confetti";

export const useConfetti = () => {
    const fire = (opts?: confetti.Options) => {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#f48024", "#0077cc", "#2ecc71", "#e74c3c", "#9b59b6"],
            ...opts,
        });
    };

    const fireStar = () => {
        confetti({
            shapes: ["star"],
            particleCount: 80,
            spread: 55,
            origin: { y: 0.5 },
            colors: ["#FFD700", "#FFA500", "#FF6347"],
        });
    };

    return { fire, fireStar };
};
