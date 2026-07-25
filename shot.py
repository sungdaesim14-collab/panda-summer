"""스도쿠 유일해 보장 + 생성 속도 검증."""
import pathlib, sys, time
from playwright.sync_api import sync_playwright

URL = "http://localhost:5180/"
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    pg.goto(URL, timeout=20000); time.sleep(1.0)

    res = pg.evaluate("""async () => {
      const mod = await import('/src/game/sudoku.ts');
      // countSolutions는 export 안 됐으니 makePuzzle 결과의 puzzle을 다시 채워 검증할 순 없다.
      // 대신 여러 날짜/난이도로 만들고, given 개수(=힌트)와 생성시간을 잰다.
      // 유일해 검증: puzzle을 백트래킹으로 풀어 해가 1개인지 직접 센다.
      function canPlace(g,r,c,v){
        for(let i=0;i<9;i++){ if(g[r][i]===v||g[i][c]===v) return false; }
        const br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
        for(let i=br;i<br+3;i++)for(let j=bc;j<bc+3;j++) if(g[i][j]===v) return false;
        return true;
      }
      function count(g,limit){
        let er=-1,ec=-1;
        for(let r=0;r<9&&er<0;r++)for(let c=0;c<9;c++) if(g[r][c]===0){er=r;ec=c;break;}
        if(er<0) return 1;
        let n=0;
        for(let v=1;v<=9;v++) if(canPlace(g,er,ec,v)){ g[er][ec]=v; n+=count(g,limit-n); g[er][ec]=0; if(n>=limit)break; }
        return n;
      }
      const out=[];
      for (const [day,easy] of [[1,false],[6,false],[13,false],[1,true],[10,true]]) {
        const t0=performance.now();
        const pz=mod.makePuzzle('2026-07-'+String(26+ (day%5)).padStart(2,'0'), day, easy);
        const ms=performance.now()-t0;
        const blanks=pz.puzzle.flat().filter(x=>x===0).length;
        const sols=count(pz.puzzle.map(r=>r.slice()),2);
        out.push({day,easy,blanks,sols,ms:Math.round(ms)});
      }
      return out;
    }""")
    for r in res:
        tag = "토끼" if r["easy"] else "일반"
        uniq = "유일해✓" if r["sols"]==1 else f"복수해✗({r['sols']})"
        print(f"{tag} {r['day']}회차: 빈칸 {r['blanks']}, {uniq}, 생성 {r['ms']}ms")
    b.close()

print("\nJS 에러:", "\n".join(errors) if errors else "없음")
