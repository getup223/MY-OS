/* ------------------------------------------------------------
           SYSTEM LOGIC
           ------------------------------------------------------------ */
        const sys = { user: "GUEST", audioCtx: null, gameInt: null };
        const dom = {
            bios: document.getElementById('bios-layer'), biosText: document.getElementById('bios-text'),
            login: document.getElementById('login-layer'), userIn: document.getElementById('username'),
            loginBtn: document.getElementById('btn-login'), ui: document.getElementById('ui-layer'),
            term: document.getElementById('terminal-window'), input: document.getElementById('cmd-input'),
            send: document.getElementById('send-btn'), hudUser: document.getElementById('hud-user'),
            clock: document.getElementById('clock-display'), gameMenu: document.getElementById('game-menu'),
            gameOverlay: document.getElementById('game-overlay'), fwCanvas: document.getElementById('fireworks-canvas'),
            celebOverlay: document.getElementById('celebration-overlay'), outro: document.getElementById('outro-layer')
        };

        /* ------------------------------------------------------------
           AUDIO ENGINE
           ------------------------------------------------------------ */
        const sfx = {
            init: () => {
                if(!sys.audioCtx) sys.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if(sys.audioCtx.state === 'suspended') sys.audioCtx.resume();
            },
            play: (type) => {
                if(!sys.audioCtx) return;
                const ctx = sys.audioCtx; const osc = ctx.createOscillator(); const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination); const t = ctx.currentTime;

                if (type === 'key') {
                    osc.type='square'; osc.frequency.setValueAtTime(600 + Math.random()*200, t);
                    gain.gain.setValueAtTime(0.02, t); osc.start(t); osc.stop(t+0.05);
                } else if (type === 'boot') {
                    osc.type='sawtooth'; osc.frequency.setValueAtTime(100, t);
                    osc.frequency.linearRampToValueAtTime(800, t+0.6);
                    gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0, t+0.6);
                    osc.start(t); osc.stop(t+0.6);
                } else if (type === 'tune') {
                    // Celebration Melody
                    const n = [261, 329, 392, 523, 493];
                    n.forEach((f,i) => {
                        const o=ctx.createOscillator(); const g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
                        o.frequency.value=f; g.gain.setValueAtTime(0.1, t+i*0.3); g.gain.exponentialRampToValueAtTime(0.001, t+i*0.3+0.4);
                        o.start(t+i*0.3); o.stop(t+i*0.3+0.4);
                    });
                } else if (type === 'boom') {
                    osc.type='lowpass'; osc.frequency.setValueAtTime(100, t);
                    gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.01, t+0.5);
                    osc.start(t); osc.stop(t+0.5);
                }
            }
        };

        /* ------------------------------------------------------------
           BIOS & LOGIN
           ------------------------------------------------------------ */
        const biosLog = [
            "BIOS DATE 30/12/2025 23:59:59 VER 1.0",
            "CPU: SALAH_UDDIN_ARCH X14, 4096 CORES",
            "RAM: 8192 TB CHECKED... OK",
            "LOADING KERNEL... SALAH_OS_GODMODE.SYS",
            "INITIALIZING NEURAL INTERFACE... OK",
            "SYSTEM READY."
        ];

        window.onload = () => {
            dom.biosText.innerHTML = "<div style='color:var(--alert); cursor:pointer; font-weight:bold; font-size:1.2rem; margin-top:20px;'>[ TAP TO BOOT SYSTEM ]</div>";
            document.body.onclick = startBios;
        };

        async function startBios() {
            document.body.onclick = null; sfx.init(); dom.biosText.innerHTML = "";
            for(let l of biosLog) {
                const d = document.createElement('div'); d.className="bios-line"; d.innerText=l; dom.biosText.appendChild(d);
                sfx.play('key'); await new Promise(r => setTimeout(r, 100));
            }
            await new Promise(r => setTimeout(r, 500));
            dom.bios.classList.add('hidden'); dom.login.classList.remove('hidden'); dom.userIn.focus();
        }

        dom.loginBtn.onclick = () => {
            sys.user = dom.userIn.value.trim().toUpperCase() || "GUEST";
            dom.hudUser.innerText = sys.user; sfx.play('boot');
            dom.login.classList.add('fade-out');
            setTimeout(() => { dom.login.classList.add('hidden'); dom.ui.style.opacity = 1; 
                print(`Welcome back, ${sys.user}.`, "log-info");
                print("SalahUddin OS v -> NONE loaded.", "log-txt");
                print("Type 'help' for commands.", "log-warn");
                dom.input.focus();
            }, 800);
        };

        function print(msg, type="log-txt") {
            const d = document.createElement('div'); d.className = "log";
            if(type==="log-cmd") d.innerHTML = `<span class="log-cmd">${msg}</span>`;
            else d.innerHTML = `<span class="os-badge">OS</span> <span class="${type}">${msg}</span>`;
            dom.term.insertBefore(d, document.getElementById('watermark'));
            dom.term.scrollTop = dom.term.scrollHeight;
        }

        /* ------------------------------------------------------------
           COMMAND PROCESSOR
           ------------------------------------------------------------ */
        dom.send.onclick = handleCmd; dom.input.onkeydown = e => { if(e.key === 'Enter') handleCmd(); };
        function handleCmd() {
            const v = dom.input.value.trim(); if(!v) return;
            sfx.play('key'); print(`${sys.user} > ${v}`, "log-cmd");
            process(v.toLowerCase()); dom.input.value="";
        }

        function process(raw) {
            const [cmd, arg] = raw.split(' ');
            const cmds = {
                'help': () => {
                    print("AVAILABLE COMMANDS:", "log-info");
                    const list = ["socials", "celebrate", "game", "quote-life", "quote-dev", "quote-respect", "theme", "time", "weather", "capture", "exit"];
                    let h = `<div class="cmd-grid">`; list.forEach((i,x)=>h+=`<div class="cmd-item"><span class="cmd-key">${x+1}.</span> <span class="cmd-val">${i}</span></div>`);
                    print(h+"</div>", "log-txt");
                },
                'socials': () => print(`<div class="social-row"><a href="https://github.com/salahuddingfx" target="_blank" class="social-btn">GITHUB</a><a href="https://facebook.com/salahuddingfx" target="_blank" class="social-btn">FACEBOOK</a><a href="https://linkedin.com/in/salahuddingfx" class="social-btn">LINKEDIN</a><a href="https://instagram.com/salahuddingfx" class="social-btn">INSTAGRAM</a><a href="https://sakachowdhury.nbsk.top" class="social-btn">PORTFOLIO</a></div>`, "log-txt"),
                'celebrate': () => { print("LAUNCHING NEW YEAR PROTOCOL...", "log-warn"); fireCelebrate(); },
                'game': () => dom.gameMenu.style.display = 'flex',
                'quote-life': () => q(["The best way to predict the future is to create it.", "Your time is limited.", "Dream big, start small."]),
                'quote-dev': () => q(["It works on my machine.", "Code never lies.", "Simplicity is the soul of efficiency."]),
                'quote-respect': () => q(["Respect is earned.", "Treat others how you want to be treated.", "Kindness is free."]),
                'theme': () => { if(['pink','gold','cyan','purple','blood'].includes(arg)) document.body.className=`theme-${arg}`; else print("Try: pink, gold, cyan, purple, blood", "log-err"); },
                'time': () => print(`LOCAL TIME: ${new Date().toLocaleTimeString()}`, "log-txt"),
                'weather': () => print("SERVER ROOM: 20°C | OUTSIDE: STABLE", "log-info"),
                'capture': () => html2canvas(document.body).then(c => { const a=document.createElement('a'); a.download='OS.png'; a.href=c.toDataURL(); a.click(); }),
                'exit': () => { dom.ui.classList.add('fade-out'); setTimeout(()=>{ dom.ui.classList.add('hidden'); dom.outro.style.display='flex'; },800); }
            };
            if(cmds[cmd]) cmds[cmd](); else print("Unknown command.", "log-err");
        }
        function q(arr) { print(`"${arr[Math.floor(Math.random()*arr.length)]}"`, "log-info"); }
        window.setTheme = c => document.body.className = `theme-${c}`;
        window.closeOverlays = () => { dom.gameMenu.style.display='none'; dom.gameOverlay.style.display='none'; dom.celebOverlay.style.display='none'; clearInterval(sys.gameInt); };

        /* ------------------------------------------------------------
           GAMES
           ------------------------------------------------------------ */
        const gctx = document.getElementById('game-canvas').getContext('2d');
        window.startGame = (mode) => {
            dom.gameMenu.style.display='none'; dom.gameOverlay.style.display='flex';
            document.getElementById('game-title').innerText = mode.toUpperCase();
            if(mode==='snake') startSnake(); else startPong();
        };

        function startSnake() {
            let snake=[{x:200,y:200}], food={x:100,y:100}, dir='RIGHT', score=0;
            sys.gameInt = setInterval(() => {
                let hx=snake[0].x, hy=snake[0].y;
                if(dir=='LEFT') hx-=20; if(dir=='UP') hy-=20; if(dir=='RIGHT') hx+=20; if(dir=='DOWN') hy+=20;
                if(hx<0||hx>380||hy<0||hy>380||snake.some((s,i)=>i>0 && s.x==hx && s.y==hy)) { clearInterval(sys.gameInt); alert('Game Over!'); closeOverlays(); return; }
                if(hx==food.x && hy==food.y) { score++; document.getElementById('game-score').innerText=score; food={x:Math.floor(Math.random()*19)*20, y:Math.floor(Math.random()*19)*20}; } else snake.pop();
                snake.unshift({x:hx, y:hy});
                gctx.fillStyle="#000"; gctx.fillRect(0,0,400,400); gctx.fillStyle="red"; gctx.fillRect(food.x,food.y,20,20); gctx.fillStyle="#0f0"; snake.forEach(s=>gctx.fillRect(s.x,s.y,20,20));
            }, 100);
            document.onkeydown = e => { if(e.key=='ArrowUp'&&dir!='DOWN') dir='UP'; if(e.key=='ArrowDown'&&dir!='UP') dir='DOWN'; if(e.key=='ArrowLeft'&&dir!='RIGHT') dir='LEFT'; if(e.key=='ArrowRight'&&dir!='LEFT') dir='RIGHT'; };
        }

        function startPong() {
            let ball={x:200,y:200,vx:3,vy:3}, p1=150, p2=150, score=0;
            sys.gameInt = setInterval(() => {
                ball.x+=ball.vx; ball.y+=ball.vy;
                if(ball.y<=0 || ball.y>=390) ball.vy*=-1;
                if((ball.x<=10 && ball.y>p1 && ball.y<p1+60) || (ball.x>=380 && ball.y>p2 && ball.y<p2+60)) ball.vx*=-1;
                if(ball.x<0 || ball.x>400) { ball={x:200,y:200,vx:3,vy:3}; score=0; }
                p2 += (ball.y - (p2+30)) * 0.1;
                gctx.fillStyle="#000"; gctx.fillRect(0,0,400,400); gctx.fillStyle="#fff"; gctx.fillRect(0,p1,10,60); gctx.fillRect(390,p2,10,60); gctx.beginPath(); gctx.arc(ball.x,ball.y,5,0,Math.PI*2); gctx.fill();
            }, 16);
            document.onkeydown = e => { if(e.key=='ArrowUp') p1-=20; if(e.key=='ArrowDown') p1+=20; };
        }

        /* ------------------------------------------------------------
           CELEBRATION
           ------------------------------------------------------------ */
        function fireCelebrate() {
            sfx.play('tune');
            // Confetti
            let end = Date.now() + 3000;
            (function frame() {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
            // Fireworks
            dom.fwCanvas.style.display='block'; const ctx=dom.fwCanvas.getContext('2d');
            dom.fwCanvas.width=window.innerWidth; dom.fwCanvas.height=window.innerHeight;
            let p=[];
            const int = setInterval(()=>{
                sfx.play('boom');
                const x=Math.random()*dom.fwCanvas.width, y=Math.random()*dom.fwCanvas.height/2, color=`hsl(${Math.random()*360},100%,50%)`;
                for(let i=0;i<30;i++) p.push({x,y,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10,life:1,color});
            }, 300);
            function loop(){
                ctx.clearRect(0,0,dom.fwCanvas.width,dom.fwCanvas.height);
                for(let i=0;i<p.length;i++){ p[i].x+=p[i].vx; p[i].y+=p[i].vy; p[i].vy+=0.1; p[i].life-=0.02; ctx.globalAlpha=p[i].life; ctx.fillStyle=p[i].color; ctx.beginPath(); ctx.arc(p[i].x,p[i].y,3,0,Math.PI*2); ctx.fill(); if(p[i].life<=0)p.splice(i,1); }
                if(dom.fwCanvas.style.display==='block') requestAnimationFrame(loop);
            }
            loop();
            setTimeout(()=>{ clearInterval(int); dom.fwCanvas.style.display='none'; dom.celebOverlay.style.display='flex'; }, 4000);
        }

        // MATRIX
        const bgc = document.getElementById('bg-canvas'); const bgCtx = bgc.getContext('2d');
        let drops = []; const rs = () => { bgc.width=window.innerWidth; bgc.height=window.innerHeight; drops=new Array(Math.floor(bgc.width/20)).fill(1); };
        window.onresize=rs; rs();
        function mx() {
            bgCtx.fillStyle="rgba(0,0,0,0.1)"; bgCtx.fillRect(0,0,bgc.width,bgc.height);
            bgCtx.fillStyle="#0f0"; bgCtx.font="15px monospace";
            drops.forEach((y,i)=>{ if(Math.random()>0.98){ bgCtx.fillText(String.fromCharCode(0x30A0+Math.random()*96),i*20,y*20); if(y*20>bgc.height && Math.random()>0.98)drops[i]=0; drops[i]++; } });
            requestAnimationFrame(mx);
        }
        mx();

        // CLOCK
        setInterval(() => {
            const n = new Date();
            const date = n.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const time = n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            dom.clock.innerText = `${date} | ${time}`;
        }, 1000);
        
        // BATTERY
        if(navigator.getBattery) navigator.getBattery().then(b => document.getElementById('bat-level').innerText = Math.round(b.level*100)+"%");
