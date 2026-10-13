import net from "node:net";

const ports = [3000, 3334];

const warm = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve());
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve());
    });
  });

await Promise.all(ports.map((port) => warm(port)));
