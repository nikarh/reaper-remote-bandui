const commits = JSON.parse(process.env.COMMITS);
const id = JSON.parse(process.env.ID);

console.log(`# Release ${id}`);
console.log("");
console.log("This release was auto-generated from a push to master branch.");
console.log("");
console.log("## Changelog");
console.log("");
console.log(
    commits.map((c) => `- ${c.timestamp.substring(0, 10)} - ${c.message.split("\n")[0]} (@${c.author.username})`)
        .join("\n"))

