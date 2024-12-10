export const customLogx =
  (isLog = true) =>
  (text: string, ststus: "info" | "warn" | "error" = "info") => {
    if (isLog) {
      let line: string | undefined = undefined;
      const stack = new Error().stack;
      if (stack) {
        // Mendapatkan baris kedua dari stack trace, yang berisi informasi lokasi log
        const callerLine = stack.split("\n")[2];
        if (callerLine) {
          // Mengekstrak informasi nomor baris dari stack trace
          const lineInfo = callerLine.trim().split(" ").pop();
          // console.log(`=== WIDDLEWARE ===>: ${text} at ${lineInfo}`);
          // text = `${text} at ${lineInfo}`;
          line = lineInfo;
        } else {
          line = undefined;
        }
      }

      console.log(`
  --------------------------------------------------
  Status: ${ststus}
  Line: ${line}
  Message: ${text}
  --------------------------------------------------
      `);
    }
  };
