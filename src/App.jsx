

import { useEffect, useRef, useState } from "react";
import styled, { keyframes, ThemeProvider } from "styled-components";
import Confetti from "react-confetti";
import clickSoundFile from "./assets/click.mp3";
import resetSoundFile from "./assets/reset.mp3";
import loseSoundFile from "./assets/lose.mp3";
import gameOverSoundFile from "./assets/game-over.mp3";
import transitionSoundFile from "./assets/transition.mp3";
import bombSoundFile from "./assets/bomb.mp3";

const lightTheme = {
  background: "#f0f0f0",
  color: "#222",
  box: "#ddd",
  boxClicked: "green",
  killerBox: "black",
  surpriseBox: "#0ea5e9",
  popup: "#10b981",
  gameOver: "#dc2626",
  winText: "#facc15",
};

const darkTheme = {
  background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  color: "white",
  box: "#ddd",
  boxClicked: "green",
  killerBox: "black",
  surpriseBox: "#0ea5e9",
  popup: "#10b981",
  gameOver: "#dc2626",
  winText: "#facc15",
};

const celebration = keyframes`
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
  100% { transform: scale(0.8) rotate(360deg); opacity: 0; }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ size }) => size}, 80px);
  gap: 12px;
  margin: 30px 0;
  justify-content: center;
`;

const Box = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${(props) =>
    props.clicked
      ? props.isKiller
        ? "#ef4444"
        : props.isSurprise
        ? "#22c55e"
        : "#3b82f6"
      : "#1e293b"};
  border: 3px solid #475569;
  border-radius: 16px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "scale(1.05)")};
  }
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
`;

const Leaderboard = styled.div`
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
  width: 300px;

  h3 {
    color: #facc15;
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    padding: 0;
    text-align: left;
  }

  li {
    color: #f8fafc;
    padding: 4px 0;
  }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(to right, #141e30, #243b55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 40px 20px;
  color: #ffffff;
  text-align: center;
`;

const GameInfo = styled.div`
  margin-bottom: 30px;

  h1 {
    font-size: 3rem;
    margin-bottom: 10px;
    color: #38bdf8;
    text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
  }

  p {
    margin: 6px 0;
    font-size: 18px;
    color: #f1f5f9;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #f8fafc;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
`;

const StyledInput = styled.input`
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  outline: none;
  width: 260px;
  margin-bottom: 20px;
  background: #ffffff;
  color: #111827;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;

  &:focus {
    transform: scale(1.03);
    box-shadow: 0 0 10px #38bdf8;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(to right, #06b6d4, #3b82f6);
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
`;

const Popup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${(props) => props.theme.popup};
  color: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: bold;
  animation: ${celebration} 1s ease-in-out forwards;
  z-index: 10;
`;

const GameOverCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${(props) => props.theme.gameOver};
  padding: 30px 50px;
  border-radius: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  z-index: 20;
`;

const CelebrationText = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.theme.winText};
  text-shadow: 2px 2px 8px #000;
`;

function App() {
  const [gridSize, setGridSize] = useState(3);
  const [grid, setGrid] = useState([]);
  const [killerBox, setKillerBox] = useState(null);
  const [surpriseBoxes, setSurpriseBoxes] = useState([]);
  const [clickedBoxes, setClickedBoxes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSurprise, setIsSurprise] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [muted, setMuted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [level, setLevel] = useState(1);
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState(
    JSON.parse(localStorage.getItem("leaderboard")) || []
  );

  const clickSound = useRef(new Audio(clickSoundFile));
  const resetSound = useRef(new Audio(resetSoundFile));
  const loseSound = useRef(new Audio(loseSoundFile));
  const gameOverSound = useRef(new Audio(gameOverSoundFile));
  const transitionSound = useRef(new Audio(transitionSoundFile));
  const bombSound = useRef(new Audio(bombSoundFile));

  const totalBoxes = gridSize * gridSize;

  useEffect(() => {
    if (!showNamePrompt) initializeGame();
  }, [gridSize, level, showNamePrompt]);

  const playSound = (soundRef) => {
    if (!muted) {
      soundRef.current.currentTime = 0;
      soundRef.current.play();
    }
  };

  const initializeGame = () => {
    const total = gridSize * gridSize;
    const killer = Math.floor(Math.random() * total);
    const surprise = Array.from({ length: 2 }, () => Math.floor(Math.random() * total)).filter(
      (i) => i !== killer
    );

    setGrid(Array(total).fill(false));
    setKillerBox(killer);
    setSurpriseBoxes(surprise);
    setClickedBoxes([]);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const handleBoxClick = (index) => {
    if (grid[index] || gameOver || won) return;

    const updatedGrid = [...grid];
    updatedGrid[index] = true;
    setGrid(updatedGrid);
    setClickedBoxes((prev) => [...prev, index]);

    if (index === killerBox) {
      playSound(loseSound);
      playSound(bombSound);
      setGameOver(true);
      updateLeaderboard();
    } else {
      const surpriseHit = surpriseBoxes.includes(index);
      const points = surpriseHit ? 10 : 5;
      setIsSurprise(surpriseHit);
      setScore((prev) => prev + points);
      setShowPopup(true);
      playSound(clickSound);
      setTimeout(() => setShowPopup(false), 800);

      if (clickedBoxes.length + 1 === totalBoxes - 1) {
        playSound(transitionSound);
        setWon(true);
        updateLeaderboard();
      }
    }
  };

  const updateLeaderboard = () => {
    const newEntry = { name: playerName, score };
    const updated = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    localStorage.setItem("leaderboard", JSON.stringify(updated));
    setLeaderboard(updated);
  };

  const handlePlayAgain = () => {
    playSound(resetSound);
    initializeGame();
  };

  const handleNextLevel = () => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setGridSize(nextLevel + 2);
    initializeGame();
  };

  if (showNamePrompt) {
    return (
      <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
        <Wrapper>
          <Title>🚀 Enter Your Name to Start</Title>
          <StyledInput
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your Name"
          />
          <Button
            onClick={() => {
              if (playerName.trim()) setShowNamePrompt(false);
            }}
          >
            Start Game
          </Button>
        </Wrapper>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : lightTheme}>
      <Wrapper>
        <GameInfo>
          <h1>🎮 Safe Box Challenge - Level {level}</h1>
          <p>Player: {playerName}</p>
          <p>Score: {score}</p>
        </GameInfo>

        <Container size={gridSize}>
          {grid.map((clicked, idx) => (
            <Box
              key={idx}
              clicked={clicked}
              isKiller={idx === killerBox}
              isSurprise={surpriseBoxes.includes(idx)}
              onClick={() => handleBoxClick(idx)}
              disabled={clicked || gameOver || won}
            >
              {clicked && idx === killerBox && "💣"}
              {clicked && surpriseBoxes.includes(idx) && "🎁"}
              {clicked && !surpriseBoxes.includes(idx) && idx !== killerBox && "✅"}
            </Box>
          ))}
        </Container>

        {showPopup && <Popup>{isSurprise ? "+10 🎁" : "+5 ✅"}</Popup>}

        {won && (
          <>
            <Confetti />
            <GameOverCard>
              <CelebrationText>🎉 You Won Level {level}!</CelebrationText>
              <p>Total Score: {score}</p>
              {level < 3 ? (
                <Button onClick={handleNextLevel}>Next Level</Button>
              ) : (
                <Button onClick={handlePlayAgain}>Play Again</Button>
              )}
            </GameOverCard>
          </>
        )}

        {gameOver && (
          <GameOverCard>
            <h2>💀 Game Over</h2>
            <p>Score: {score}</p>
            <Button onClick={handlePlayAgain}>Try Again</Button>
          </GameOverCard>
        )}

        <ButtonGroup>
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀️ Light Theme" : "🌙 Dark Theme"}
          </Button>
          <Button onClick={() => setMuted(!muted)}>
            {muted ? "🔇 Unmute" : "🔊 Mute"}
          </Button>
          <Button onClick={() => setShowLeaderboard(!showLeaderboard)}>
            🏆 Leaderboard
          </Button>
        </ButtonGroup>

        {showLeaderboard && (
          <Leaderboard>
            <h3>🏅 Top 5 Scores</h3>
            <ul>
              {leaderboard.map((entry, i) => (
                <li key={i}>
                  {entry.name}: {entry.score}
                </li>
              ))}
            </ul>
          </Leaderboard>
        )}
      </Wrapper>
    </ThemeProvider>
  );
}

export default App;
