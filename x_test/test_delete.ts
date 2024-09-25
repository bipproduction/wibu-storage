import { apis } from "@/lib/routes";

const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoiY20wd2p1NXMzMDAwMGdtcHBhaXlyYWF0NSIsIm5hbWUiOiJtMiIsImVtYWlsIjoibTIiLCJBcGlLZXkiOlt7ImlkIjoiY20wd2p1NXNpMDAwMmdtcHB4MmxzOHZzbyIsIm5hbWUiOiJkZWZhdWx0In1dfSwiaWF0IjoxNzI1OTc5ODYwLCJleHAiOjQ4ODE3Mzk4NjB9.6UydaHlTN2txojIXrWPUS8Orsc4yK4DdJjzvP3gMBMI";
const orgn = "http://localhost:5000";
async function test() {
  const res = await fetch(
    orgn +
      apis["/api/files/delete/[dirId]/[name]"]({
        dirId: "cm0wjursk0006gmppiugqjnv8",
        name: "download.jpg"
      }),
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  );

  const dataText = await res.text();
  console.log(dataText);
}

test();
