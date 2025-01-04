import { useState, useEffect } from "react";

interface WindowSize {
    width: number;
    height: number;
}

const useWindowSize = (): WindowSize => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Set initial size on mount

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
};

export default useWindowSize;
