import { app } from "./app";
import "./fanpage/fanpage";
import "./fanpage/integrity";
import "./fanpage/hackatime";
import "./fanpage/git";
import "./fanpage/journal";
import "./fanpage/submit";

await app.start(process.env.PORT || 3000).then(() => {
    console.log("wilbur is awake!");
});