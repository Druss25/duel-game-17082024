import { useRef, useEffect, useState } from "react";

const DuelGame = () => {
    const canvasRef = useRef(null);
    const [hero1, setHero1] = useState({ x: 50, y: 100, dx: 0, dy: 3, color: "blue", speed: 1, fireRate: 1000 });
    const [hero2, setHero2] = useState({ x: 450, y: 100, dx: 0, dy: 3, color: "red", speed: 2, fireRate: 1000 });
    const [bullets, setBullets] = useState([]);
    const [score, setScore] = useState({ hero1: 0, hero2: 0 });
    const [menu, setMenu] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId = null;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Рисуем героев
            drawHero(ctx, hero1);
            drawHero(ctx, hero2);

            // Обновляем и рисуем снаряды
            bullets.forEach((bullet, idx) => {
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;

                bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height
                    ? bullets.splice(idx, 1)
                    : drawBullet(ctx, bullet);
            });

            // Обновление позиций героев
            updateHeroPosition(hero1, canvas);
            updateHeroPosition(hero2, canvas);

            // Попадание снарядом в противника
            detectCollisions();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hero1, hero2, bullets]);

    useEffect(() => {
        const fireInterval1 = setInterval(() => {
            setBullets((bullets) => [
                ...bullets,
                { x: hero1.x, y: hero1.y, dx: 2, dy: 0, color: hero1.color, owner: "hero1" }
            ]);
        }, hero1.fireRate);

        const fireInterval2 = setInterval(() => {
            setBullets((bullets) => [
                ...bullets,
                { x: hero2.x, y: hero2.y, dx: -2, dy: 0, color: hero2.color, owner: "hero2" }
            ]);
        }, hero2.fireRate);

        return () => {
            clearInterval(fireInterval1);
            clearInterval(fireInterval2);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hero1.fireRate, hero2.fireRate, hero1.color, hero2.color, bullets]);

    const drawHero = (ctx, hero) => {
        ctx.fillStyle = hero.color;
        ctx.beginPath();
        ctx.arc(hero.x, hero.y, 20, 0, Math.PI * 2);
        ctx.fill();
    };

    const drawBullet = (ctx, bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    };

    const updateHeroPosition = (hero, canvas) => {
        // Отталкивание от курсора мыши
        if (Math.hypot(hero.x - mousePos.x, hero.y - mousePos.y) < 30) {
            hero.dy = -hero.dy;
        }
        hero.y += hero.dy * hero.speed;
        if (hero.y - 20 < 0 || hero.y + 20 > canvas.height) {
            hero.dy *= -1;
        }
    };

    const detectCollisions = () => {
        bullets.forEach((bullet, idx) => {
            if (Math.hypot(bullet.x - hero1.x, bullet.y - hero1.y) < 25 && bullet.owner !== "hero1") {
                setScore((score) => ({ ...score, hero2: score.hero2 + 1 }));
                bullets.splice(idx, 1);
            } else if (Math.hypot(bullet.x - hero2.x, bullet.y - hero2.y) < 25 && bullet.owner !== "hero2") {
                setScore((score) => ({ ...score, hero1: score.hero1 + 1 }));
                bullets.splice(idx, 1);
            }
        });
    };

    const handleCanvasClick = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (Math.hypot(x - hero1.x, y - hero1.y) < 20) {
            setMenu({ hero: "hero1", x: x + rect.left, y: y + rect.top });
        } else if (Math.hypot(x - hero2.x, y - hero2.y) < 20) {
            setMenu({ hero: "hero2", x: x + rect.left, y: y + rect.top });
        }
    };

    const handleMouseMove = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const changeColor = (hero, color) => {
        hero === "hero1" ? setHero1((prev) => ({ ...prev, color })) : setHero2((prev) => ({ ...prev, color }));
        setMenu(null);
    };

    const handleSpeedChange = (hero, value) => {
        hero === "hero1"
            ? setHero1((prev) => ({ ...prev, speed: value }))
            : setHero2((prev) => ({ ...prev, speed: value }));
    };

    const handleFireRateChange = (hero, value) => {
        hero === "hero1"
            ? setHero1((prev) => ({ ...prev, fireRate: value }))
            : setHero2((prev) => ({ ...prev, fireRate: value }));
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={300}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
            />
            <div>
                <span>
                    Общий счет: - Герой 1: <strong style={{ color: hero1.color }}>{score.hero1}</strong>, Герой 2:&nbsp;
                    <strong style={{ color: hero2.color }}>{score.hero2}</strong>
                </span>
            </div>
            {menu && (
                <div
                    style={{
                        position: "absolute",
                        left: menu.x,
                        top: menu.y,
                        backgroundColor: "white",
                        border: "1px solid black",
                        padding: "10px"
                    }}
                >
                    <div>
                        <button onClick={() => changeColor(menu.hero, "blue")}>Blue</button>
                        <button onClick={() => changeColor(menu.hero, "red")}>Red</button>
                        <button onClick={() => changeColor(menu.hero, "green")}>Green</button>
                    </div>
                    <div>
                        <label>Speed:</label>
                        <input
                            type='range'
                            min='1'
                            max='10'
                            value={menu.hero === "hero1" ? hero1.speed : hero2.speed}
                            onChange={(e) => handleSpeedChange(menu.hero, parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Fire Rate (ms):</label>
                        <input
                            type='range'
                            min='500'
                            max='2000'
                            step='100'
                            value={menu.hero === "hero1" ? hero1.fireRate : hero2.fireRate}
                            onChange={(e) => handleFireRateChange(menu.hero, parseInt(e.target.value))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuelGame;
