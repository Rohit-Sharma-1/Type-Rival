import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://type-rival.onrender.com");

const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const targetText =
    location.state?.text || "The quick brown fox jumps over the lazy dog.";
  const roomId = location.state?.roomId || "empty-room";

  const [typed, setTyped] = useState("");
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [time, setTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [errors, setErrors] = useState(0);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [winner, setWinner] = useState<string | null>(null);

  // 🔄 Rejoin room if page refreshed
  useEffect(() => {
    const savedRoomId = localStorage.getItem("roomId");
    if (savedRoomId) {
      socket.emit("rejoinRoom", savedRoomId);
    }
  }, []);

  // 👇 Emit progress every time user types
  useEffect(() => {
    socket.emit("progressUpdate", {
      progress: typed.length / targetText.length,
      roomId: roomId,
    });
  }, [typed, roomId, targetText.length]);

  // 👂 Listen for opponent’s progress
  useEffect(() => {
    const handleOpponentProgress = ({ progress }: { progress: number }) => {
      try {
        setOpponentProgress(progress);
      } catch (error) {
        console.error("Error handling opponent progress:", error);
      }
    };

    socket.on("opponentProgress", handleOpponentProgress);

    return () => {
      socket.off("opponentProgress", handleOpponentProgress);
    };
  }, []);

  // 👂 Listen for playerFinished
  useEffect(() => {
    if (typed.length === targetText.length && !finished) {
      setFinished(true);
    }
  }, [typed, finished, roomId, targetText.length]);

  useEffect(() => {
    if (finished) {
      const me = typed.length / targetText.length;
      const opponent = opponentProgress;

      let result: string | null = null;

      if (errors > 0) {
        result = "😔 You lost! You made mistakes.";
      }
      if (me === 1 && opponent < 1) {
        result = "🏆 You won !";
      } else if (opponent === 1 && me < 1) {
        result = "😔 You lost! Opponent finished first.";
      } else if (me === 1 && opponent === 1) {
        result = "🤝 It's a tie!";
      } else {
        // Timer ended, no one finished — decide by progress
        if (me > opponent) result = "🏆 You won!";
        else if (me < opponent) result = "😔 You lost!";
        else result = "🤝 It's a tie!";
      }

      setWinner(result);
    }
  }, [finished]);

  // ⏳ Countdown before start
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0 && !started) {
      setStarted(true);
    }
  }, [countdown, started]);

  // 🕒 Timer with 30-second cap
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (started && !finished) {
      timer = setInterval(() => {
        setTime((t) => {
          if (t >= 29) {
            setFinished(true);
            clearInterval(timer);
            return 30;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, finished]);

  // ⌨️ Handle typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started || finished || time >= 30) return;

      if (e.key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1) {
        setTyped((prev) => {
          const next = prev + e.key;
          if (next.length === targetText.length) {
            setFinished(true);
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, finished, time, targetText.length]);

  // 🧮 Stats after finish
  useEffect(() => {
    if (finished) {
      // Avoid dividing by zero if time is 0
      const words = typed.trim().split(/\s+/).filter(Boolean).length;
      const minutes = time > 0 ? time / 60 : 1;
      const grossWpm = Math.round(words / minutes);

      // Use Array.from instead of [...string] for better TS support
      const typedChars = Array.from(typed);
      const targetChars = Array.from(targetText);

      const wrongChars = typedChars.filter(
        (ch, i) => ch !== targetChars[i]
      ).length;

      setErrors(wrongChars);
      setWpm(isNaN(grossWpm) ? 0 : grossWpm);
    }
  }, [finished, time, typed, targetText]);

  // 💡 Move cursor with typing
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [typed]);

  const reset = () => {
    navigate("/room");
  };

  const renderText = () => {
    return targetText.split("").map((char: string, i: number) => {
      let color = "text-gray-500";
      if (i < typed.length) {
        color = typed[i] === char ? "text-green-400" : "text-red-500";
      }
      const isMyCursor = i === typed.length;
      const isOpponentCursor =
        i === Math.floor(opponentProgress * targetText.length);

      return (
        <span key={i} className="relative">
          <span className={`${color}`}>{char}</span>
          {isMyCursor && (
            <span
              ref={cursorRef}
              className="absolute bottom-0 left-0 w-1 h-8 bg-yellow-300 animate-pulse"
            ></span>
          )}
          {isOpponentCursor && (
            <span className="absolute bottom-0 left-0 w-1 h-8 bg-pink-500 animate-pulse"></span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-linear-to-b from-black via-gray-900 to-purple-900 text-white font-mono">
      <h1 className="absolute top-6 left-6 text-fuchsia-700 text-4xl font-bold z-20">
        TypeRival
      </h1>
      {!finished && (
        <div className="flex w-4/5 gap-10">
          <div className="flex-1 bg-gray-800 p-10 rounded-xl shadow-lg overflow-hidden">
            <h1 className="text-5xl font-bold mb-8 text-fuchsia-500 text-center">
              ⏰ Time Left:{" "}
              <span className="text-yellow-400 font-bold">{30 - time}s</span>
            </h1>

            {countdown > 0 && (
              <p className="text-6xl text-yellow-400 font-bold text-center">
                {countdown}
              </p>
            )}

            {countdown === 0 && (
              <div className="text-2xl leading-relaxed tracking-wider">
                {renderText()}
              </div>
            )}
          </div>
        </div>
      )}
      {finished && (
        <div className="flex w-4/5 h-[450px] bg-gray-800 p-10 rounded-xl shadow-lg overflow-hidden relative">
          <h1 className="absolute top-20 left-102 text-5xl font-bold mb-4 text-fuchsia-500 text-center">
            {winner}
          </h1>
          <button
            onClick={reset}
            className="absolute bottom-40 left-120  h-[50px] w-[200px] bg-fuchsia-700 hover:bg-fuchsia-900 px-6 py-2 rounded-lg font-semibold"
          >
            Restart
          </button>
          <p className="absolute bottom-15 left-60 transform  text-green-400 text-3xl text-center">
            WPM: {wpm}
          </p>
          <p className="absolute bottom-15 left-200 transform  text-red-400 text-3xl text-center">
            Errors: {errors}
          </p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
