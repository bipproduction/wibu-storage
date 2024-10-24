import { apies } from "@/lib/routes";

const envToken = process.env.TEST_TOKEN as string;
const token = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoiY20wd2p1NXMzMDAwMGdtcHBhaXlyYWF0NSIsIm5hbWUiOiJtMiIsImVtYWlsIjoibTIiLCJBcGlLZXkiOlt7ImlkIjoiY20wd2p1NXNpMDAwMmdtcHB4MmxzOHZzbyIsIm5hbWUiOiJkZWZhdWx0In1dfSwiaWF0IjoxNzI1OTc5ODYwLCJleHAiOjQ4ODE3Mzk4NjB9.6UydaHlTN2txojIXrWPUS8Orsc4yK4DdJjzvP3gMBMI";
const orgn = "http://localhost:5000";
(async () => {
  const copy = await fetch(
    orgn +
      apies["/api/files/copy/[from]/[to]"]({
        from: "cm0wka2oe000cgmppwqm2ll48",
        to: "cm0wjursk0006gmppiugqjnv8"
      }),
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        fileId: "cm0yppe4n0003hfet5f2phxxx"
      })
    }
  );

  const dataText = await copy.text();
  console.log(dataText);
})();
