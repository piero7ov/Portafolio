/* =========================================================
   script.js
   - Boot screen tipo Terminal (Win95 / MS-DOS) + localStorage
   - Interacción: al terminar, espera ENTER para continuar
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const bootScreen = document.getElementById("boot-screen");
    const bootLog = document.getElementById("boot-log");
    const bootBar = document.getElementById("boot-progress-bar");
    const bootStatus = document.getElementById("boot-status");

    if (!bootScreen || !bootLog || !bootBar || !bootStatus) return;

    const STORAGE_KEY = "pierodev_boot_seen";

    // Atajo debug: Ctrl + Shift + R -> reinicia boot
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    const seenBoot = localStorage.getItem(STORAGE_KEY) === "1";

    if (seenBoot) {
        hideBoot();
        return;
    }

    // Ejecuta boot y al final espera ENTER
    runBootSequence()
        .then(waitForEnter)
        .then(() => {
            localStorage.setItem(STORAGE_KEY, "1");
            hideBoot();
        });

    /* =========================================================
       Helpers
       ========================================================= */

    function hideBoot() {
        bootScreen.classList.add("hidden");
        bootScreen.setAttribute("aria-hidden", "true");
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function setProgress(percent) {
        const p = Math.max(0, Math.min(100, percent));
        bootBar.style.width = p + "%";
    }

    // Typewriter
    async function typeText(targetEl, text, speedMin = 6, speedMax = 16) {
        for (let i = 0; i < text.length; i++) {
            targetEl.textContent += text[i];
            const jitter = Math.floor(Math.random() * (speedMax - speedMin + 1)) + speedMin;
            await sleep(jitter);
        }
    }

    async function printLine(line, delayAfter = 80) {
        await typeText(bootLog, line);
        bootLog.textContent += "\n";
        bootLog.scrollTop = bootLog.scrollHeight;
        await sleep(delayAfter);
    }

    // Imprime con prompt tipo DOS
    async function dosCommand(cmd, outputLines = [], delayAfterCmd = 120) {
        await printLine(`C:\\PIERODEV>${cmd}`, 40);
        await sleep(delayAfterCmd);
        for (const out of outputLines) {
            await printLine(out, 50);
        }
    }

    /* =========================================================
       Boot sequence (Terminal style)
       ========================================================= */
    async function runBootSequence() {
        bootLog.textContent = "";
        bootStatus.textContent = "";
        setProgress(0);

        // Encabezado tipo MS-DOS / Windows 95
        await printLine("Microsoft(R) Windows 95");
        await printLine("(C)Copyright Microsoft Corp 1981-1995.");
        await printLine("");

        // Simulación de comandos + progreso
        const steps = [
            { pct: 10, cmd: "ver", out: ["MS-DOS Version 7.0"] },
            { pct: 20, cmd: "mem /c", out: ["Memory status: OK", "Conventional: 640K", "Extended: 64MB"] },
            { pct: 35, cmd: "cd PORTAFOLIO", out: [""] },
            { pct: 50, cmd: "loading modules", out: ["[OK] ui.dll", "[OK] render.dll", "[OK] net.dll"] },
            { pct: 70, cmd: "fetch proyectos.json", out: ["Downloading: proyectos.json ... OK"] },
            { pct: 85, cmd: "parse proyectos.json", out: ["Parsing data ... OK", "Projects detected ... OK"] },
            { pct: 100, cmd: "start portfolio.exe", out: ["Launching interface ... OK"] }
        ];

        for (const s of steps) {
            setProgress(s.pct);
            await dosCommand(s.cmd, s.out, 120);
            await sleep(80);
        }

        bootStatus.textContent = "System ready.";
        await sleep(300);
    }

    /* =========================================================
       Esperar ENTER para continuar (interacción)
       ========================================================= */
    function waitForEnter() {
        return new Promise((resolve) => {
            bootStatus.textContent = "Press ENTER to continue...";

            // Cursor parpadeante simple (sin CSS extra)
            let showCursor = true;
            const cursorTimer = setInterval(() => {
                showCursor = !showCursor;
                // Simula un cursor al final del log
                // (No modifica el log para no romper líneas)
                bootStatus.textContent = showCursor
                    ? "Press ENTER to continue... _"
                    : "Press ENTER to continue...  ";
            }, 350);

            function onKeyDown(e) {
                if (e.key === "Enter") {
                    clearInterval(cursorTimer);
                    document.removeEventListener("keydown", onKeyDown);
                    resolve();
                }
            }

            document.addEventListener("keydown", onKeyDown);
        });
    }
});
