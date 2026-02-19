"use client";

import type { CountdownTimerConfig } from "@/types/shop";

import { useState, useEffect, useMemo } from "react";
import { m, LazyMotion, domAnimation } from "framer-motion";

interface CountdownTimerComponentProps {
  config: CountdownTimerConfig;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimerComponent({
  config,
}: CountdownTimerComponentProps) {
  const {
    title,
    endDate,
    subtitle,
    expiredMessage,
    backgroundColor,
    textColor,
  } = config;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const targetDate = useMemo(() => new Date(endDate), [endDate]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);

        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <m.div
        key={value}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
        initial={{ scale: 1.2, opacity: 0 }}
      >
        <span className="text-3xl md:text-4xl font-bold">
          {value.toString().padStart(2, "0")}
        </span>
      </m.div>
      <span className="text-sm md:text-base mt-2 opacity-80">{label}</span>
    </div>
  );

  return (
    <LazyMotion features={domAnimation}>
      <section
        className="py-16 px-4"
        style={{
          backgroundColor:
            backgroundColor ||
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          background:
            backgroundColor ||
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: textColor || "#ffffff",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-lg opacity-80 mb-8">{subtitle}</p>}

          {isExpired ? (
            <div className="py-8">
              <p className="text-2xl">
                {expiredMessage || "This offer has ended!"}
              </p>
            </div>
          ) : timeLeft ? (
            <div className="flex justify-center gap-4 md:gap-8">
              <TimeBlock label="Days" value={timeLeft.days} />
              <div className="flex items-center text-3xl font-light opacity-50">
                :
              </div>
              <TimeBlock label="Hours" value={timeLeft.hours} />
              <div className="flex items-center text-3xl font-light opacity-50">
                :
              </div>
              <TimeBlock label="Minutes" value={timeLeft.minutes} />
              <div className="flex items-center text-3xl font-light opacity-50">
                :
              </div>
              <TimeBlock label="Seconds" value={timeLeft.seconds} />
            </div>
          ) : (
            <div className="py-8 animate-pulse">
              <p>Loading...</p>
            </div>
          )}
        </div>
      </section>
    </LazyMotion>
  );
}
