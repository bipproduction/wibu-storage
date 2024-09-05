import { libServer } from "@/lib/lib_server";

(async () => {
  const token = await libServer.encrypt({
    user: { name: "malik", email: "malik@malik", id: "malik" },
    exp: "7 year",
  });

  const user = await libServer.decrypt({ token });
  console.log(user);
})();
